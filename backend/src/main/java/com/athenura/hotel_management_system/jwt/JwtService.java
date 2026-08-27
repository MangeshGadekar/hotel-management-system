package com.athenura.hotel_management_system.jwt;
import com.athenura.hotel_management_system.common.entity.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
// import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
// import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;

@Service
public class JwtService {


    private static final String SECRET_KEY =
            "9A7F4D8B3E6C1A5F8D2E9B4C7F6A1D3E9F5C2B7A4D8E1F6";

// Old version of jwtService with Key type
//     private Key getSignInKey() {
// //        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
//         return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
//     }


    private SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }
    public String generateToken(Users userDetails){

        return Jwts.builder()

                .setSubject(userDetails.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis()
                                +60*1000) // 1 minute
                )
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }




// Old version of extractAllClaims They return Claims obj
    // private Claims extractAllClaims(String token) {

    //     return Jwts
    //             .parserBuilder()
    //             .setSigningKey(getSignInKey())
    //             .build()
    //             .parseClaimsJws(token)
    //             .getBody();
    // }

    // New version of extractAllClaims They return Claims obj
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

        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    public boolean isTokenValid(String token, Users user) {

        String email = extractUsername(token);

        return email.equals(user.getEmail())
                && !isTokenExpired(token);
    }

}
