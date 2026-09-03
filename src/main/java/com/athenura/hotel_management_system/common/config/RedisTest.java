package com.athenura.hotel_management_system.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisTest implements CommandLineRunner {

    private final StringRedisTemplate redisTemplate;

    @Override
    public void run(String... args) {

        redisTemplate.opsForValue()
                .set("test-key", "Redis connected successfully");

        String value = redisTemplate.opsForValue()
                .get("test-key");

        System.out.println("Redis value: " + value);
    }
}