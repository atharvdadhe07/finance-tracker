package com.financetracker.integration;

import com.financetracker.dto.SummaryResponse;
import com.financetracker.dto.TransactionRequest;
import com.financetracker.dto.TransactionResponse;
import com.financetracker.model.TransactionType;
import com.redis.testcontainers.RedisContainer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class TransactionControllerIT {

    @Container
    private static final RedisContainer REDIS = new RedisContainer(
            DockerImageName.parse("redis:7.2.4")
    );

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", REDIS::getFirstMappedPort);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @AfterEach
    void cleanUp() {
        if (stringRedisTemplate.getConnectionFactory() != null) {
            try (RedisConnection connection = stringRedisTemplate.getConnectionFactory().getConnection()) {
                connection.serverCommands().flushDb();
            }
        }
    }

    @Test
    void testCreateTransaction() {
        TransactionRequest req = TransactionRequest.builder()
                .amount(new BigDecimal("150.00"))
                .type(TransactionType.EXPENSE)
                .category("Food")
                .date(LocalDate.now())
                .note("Team lunch")
                .build();

        ResponseEntity<TransactionResponse> response = restTemplate.postForEntity(
                "/api/transactions",
                req,
                TransactionResponse.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        TransactionResponse body = response.getBody();
        assertNotNull(body);
        assertNotNull(body.getId());
        assertEquals(new BigDecimal("150.00"), body.getAmount());
        assertEquals(TransactionType.EXPENSE, body.getType());
        assertEquals("Food", body.getCategory());
        assertEquals("Team lunch", body.getNote());
        assertNotNull(body.getCreatedAt());
        assertNotNull(body.getUpdatedAt());
    }

    @Test
    void testGetAllTransactionsIncludesCreated() {
        TransactionRequest req = TransactionRequest.builder()
                .amount(new BigDecimal("200.00"))
                .type(TransactionType.EXPENSE)
                .category("Shopping")
                .date(LocalDate.now())
                .note("Office supplies")
                .build();

        ResponseEntity<TransactionResponse> createResponse = restTemplate.postForEntity(
                "/api/transactions",
                req,
                TransactionResponse.class
        );
        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        String createdId = Objects.requireNonNull(createResponse.getBody()).getId();

        ResponseEntity<TransactionResponse[]> listResponse = restTemplate.getForEntity(
                "/api/transactions",
                TransactionResponse[].class
        );

        assertEquals(HttpStatus.OK, listResponse.getStatusCode());
        TransactionResponse[] transactions = listResponse.getBody();
        assertNotNull(transactions);
        assertTrue(transactions.length >= 1);

        boolean found = false;
        for (TransactionResponse txn : transactions) {
            if (createdId.equals(txn.getId())) {
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    @Test
    void testUpdateTransaction() {
        TransactionRequest createReq = TransactionRequest.builder()
                .amount(new BigDecimal("80.00"))
                .type(TransactionType.EXPENSE)
                .category("Entertainment")
                .date(LocalDate.now())
                .note("Concert ticket")
                .build();

        ResponseEntity<TransactionResponse> createResponse = restTemplate.postForEntity(
                "/api/transactions",
                createReq,
                TransactionResponse.class
        );
        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        String id = Objects.requireNonNull(createResponse.getBody()).getId();

        TransactionRequest updateReq = TransactionRequest.builder()
                .amount(new BigDecimal("95.00"))
                .type(TransactionType.EXPENSE)
                .category("Entertainment")
                .date(LocalDate.now())
                .note("Concert ticket with parking pass")
                .build();

        ResponseEntity<TransactionResponse> updateResponse = restTemplate.exchange(
                "/api/transactions/" + id,
                HttpMethod.PUT,
                new HttpEntity<>(updateReq),
                TransactionResponse.class
        );

        assertEquals(HttpStatus.OK, updateResponse.getStatusCode());
        TransactionResponse updatedBody = updateResponse.getBody();
        assertNotNull(updatedBody);
        assertEquals(id, updatedBody.getId());
        assertEquals(new BigDecimal("95.00"), updatedBody.getAmount());
        assertEquals("Concert ticket with parking pass", updatedBody.getNote());
    }

    @Test
    void testDeleteTransaction() {
        TransactionRequest createReq = TransactionRequest.builder()
                .amount(new BigDecimal("50.00"))
                .type(TransactionType.EXPENSE)
                .category("Transport")
                .date(LocalDate.now())
                .note("Taxi ride")
                .build();

        ResponseEntity<TransactionResponse> createResponse = restTemplate.postForEntity(
                "/api/transactions",
                createReq,
                TransactionResponse.class
        );
        assertEquals(HttpStatus.CREATED, createResponse.getStatusCode());
        String id = Objects.requireNonNull(createResponse.getBody()).getId();

        ResponseEntity<Void> deleteResponse = restTemplate.exchange(
                "/api/transactions/" + id,
                HttpMethod.DELETE,
                null,
                Void.class
        );
        assertEquals(HttpStatus.NO_CONTENT, deleteResponse.getStatusCode());

        ResponseEntity<String> getResponse = restTemplate.getForEntity(
                "/api/transactions/" + id,
                String.class
        );
        assertEquals(HttpStatus.NOT_FOUND, getResponse.getStatusCode());
    }

    @Test
    void testGetSummaryReturnsCorrectTotals() {
        TransactionRequest incomeReq = TransactionRequest.builder()
                .amount(new BigDecimal("5000.00"))
                .type(TransactionType.INCOME)
                .category("Salary")
                .date(LocalDate.now())
                .note("Monthly paycheck")
                .build();

        TransactionRequest expenseReq = TransactionRequest.builder()
                .amount(new BigDecimal("1200.00"))
                .type(TransactionType.EXPENSE)
                .category("Rent")
                .date(LocalDate.now())
                .note("Monthly apartment rent")
                .build();

        restTemplate.postForEntity("/api/transactions", incomeReq, TransactionResponse.class);
        restTemplate.postForEntity("/api/transactions", expenseReq, TransactionResponse.class);

        ResponseEntity<SummaryResponse> summaryResponse = restTemplate.getForEntity(
                "/api/summary",
                SummaryResponse.class
        );

        assertEquals(HttpStatus.OK, summaryResponse.getStatusCode());
        SummaryResponse summary = summaryResponse.getBody();
        assertNotNull(summary);
        assertEquals(new BigDecimal("5000.00"), summary.getTotalIncome());
        assertEquals(new BigDecimal("1200.00"), summary.getTotalExpenses());
        assertEquals(new BigDecimal("3800.00"), summary.getNetBalance());
        assertEquals(2, summary.getTransactionCount());
        assertEquals(new BigDecimal("1200.00"), summary.getExpenseByCategory().get("Rent"));
    }

    @Test
    void testGetExportCsvReturns200AndTextCsv() {
        TransactionRequest req = TransactionRequest.builder()
                .amount(new BigDecimal("45.00"))
                .type(TransactionType.EXPENSE)
                .category("Bills")
                .date(LocalDate.now())
                .note("Water bill")
                .build();

        restTemplate.postForEntity("/api/transactions", req, TransactionResponse.class);

        ResponseEntity<String> csvResponse = restTemplate.getForEntity(
                "/api/export/csv",
                String.class
        );

        assertEquals(HttpStatus.OK, csvResponse.getStatusCode());
        MediaType contentType = csvResponse.getHeaders().getContentType();
        assertNotNull(contentType);
        assertTrue(contentType.toString().contains("text/csv"));

        String body = csvResponse.getBody();
        assertNotNull(body);
        assertTrue(body.startsWith("id,amount,type,category,date,note"));
        assertTrue(body.contains("Bills"));
        assertTrue(body.contains("45.00"));
    }
}
