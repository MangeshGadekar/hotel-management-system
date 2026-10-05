package com.athenura.hotel_management_system.common.config;

import com.athenura.hotel_management_system.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // 1. Preflight CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/auth/**").permitAll()

                        // Guest Public Endpoints
                        .requestMatchers(HttpMethod.GET, "/guest/check-email", "/guest/search", "/guest/by-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/guest/create", "/guest/send-otp", "/guest/verify-otp").permitAll()

                        // Guest Protected Endpoints
                        .requestMatchers(HttpMethod.GET, "/guest", "/guest/{id}").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/guest/update/**").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/guest/delete/**").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")

                        // Booking Endpoints
                        .requestMatchers(HttpMethod.POST, "/booking/create").permitAll()
                        .requestMatchers(HttpMethod.GET, "/booking", "/booking/{id}").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/booking/update/**", "/booking/cancel/**").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")

                        // Payment Endpoints
                        .requestMatchers("/api/payments/pay", "/api/payments/razorpay/**").permitAll()
                        .requestMatchers("/api/payments/receipt/**", "/api/payments/booking/**").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")

                        // Admin Dashboard Explicitly Added Here
                        .requestMatchers("/admin/dashboard").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // Admin & Room Endpoints
                        .requestMatchers(HttpMethod.GET, "/admin/room", "/admin/room/{roomNumber}", "/admin/room/type/**", "/admin/room/status/**").permitAll()
                        .requestMatchers("/admin/users/**", "/admin/reports/**", "/admin/receptionist/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/admin/room/create").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/admin/room/update/**").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/admin/room/delete/**").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")
                        .requestMatchers("/reception/**", "/receptionist/**", "/checkin/**", "/checkout/**").hasAnyAuthority("ADMIN", "RECEPTIONIST", "ROLE_ADMIN", "ROLE_RECEPTIONIST")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}