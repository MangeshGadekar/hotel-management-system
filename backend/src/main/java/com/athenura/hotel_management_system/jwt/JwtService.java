package com.athenura.hotel_management_system.jwt;

import com.athenura.hotel_management_system.common.entity.Users;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String SECRET_KEY = "9A7F4D8B3E6C1A5F8D2E9B4C7F6A1D3E9F5C2B7A4D8E1F6";

    private SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Users userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getRole().name());

        long twentyFourHoursInMillis = 1000L * 60 * 60 * 24;

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + twentyFourHoursInMillis))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public boolean isTokenValid(String token, Users user) {
        String email = extractUsername(token);
        return email.equals(user.getEmail()) && !isTokenExpired(token);
    }



    //Guest token
    public String generateGuestAccessToken(Long bookingId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("bookingId", bookingId);
        claims.put("role", "ROLE_GUEST");

        long thirtyMinutesInMillis = 1000L * 60 * 30;

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + thirtyMinutesInMillis))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Long extractBookingId(String token) {
        Claims claims = extractAllClaims(token);
        Object bookingIdObj = claims.get("bookingId");
        if (bookingIdObj instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public boolean isGuestTokenValid(String token, Long bookingId, String email) {
        if (isTokenExpired(token)) return false;

        Long tokenBookingId = extractBookingId(token);
        String tokenEmail = extractUsername(token);

        return bookingId != null
                && bookingId.equals(tokenBookingId)
                && email != null
                && email.equalsIgnoreCase(tokenEmail);
    }
}




