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

    private static final String[] ADMIN_ONLY = {
            "ADMIN", "ROLE_ADMIN"
    };

    private static final String[] STAFF_ROLES = {
            "ADMIN", "ROLE_ADMIN", "RECEPTIONIST", "ROLE_RECEPTIONIST"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(
                                "/public/**",
                                "/public/booking/**",
                                "/api/public/**"
                        ).permitAll()

                        // Extra Services
                        .requestMatchers("/api/extra-services/admin/**").hasAnyAuthority(ADMIN_ONLY)
                        // Guest & Staff: Read-only access to view active catalog services
                        .requestMatchers(HttpMethod.GET, "/api/extra-services", "/api/extra-services/**").permitAll()

                        //Guest Verification-Public
                        .requestMatchers(HttpMethod.GET, "/guest/check-email", "/guest/search", "/guest/by-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/guest/create", "/guest/send-otp", "/guest/verify-otp").permitAll()

                        //Guest Operations (Staff Only: Admin & Receptionist)
                        .requestMatchers(HttpMethod.GET, "/guest", "/guest/{id}").hasAnyAuthority(STAFF_ROLES)
                        .requestMatchers(HttpMethod.PATCH, "/guest/update/**").hasAnyAuthority(STAFF_ROLES)
                        .requestMatchers(HttpMethod.DELETE, "/guest/delete/**").hasAnyAuthority(STAFF_ROLES)

                                // Booking Endpoints
                                // Public: Self-service booking creation & single booking lookups
                                .requestMatchers(HttpMethod.POST, "/booking/create").permitAll()
                                .requestMatchers(HttpMethod.GET, "/booking/reference/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/booking/{id:[0-9]+}").permitAll()

                                // Staff only: Customer reservation histories, check-in, check-out, discounts, settlements
                                .requestMatchers("/booking", "/booking/**").hasAnyAuthority(STAFF_ROLES)

                        // Payment Endpoints
                        // Public: Razorpay gateway callbacks & public receipt download
                        .requestMatchers("/api/payments/pay", "/api/payments/razorpay/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/payments/receipt/public/**").permitAll()
                        // Staff only: Ledger queries & internal receipts
                        .requestMatchers("/api/payments/receipt/**", "/api/payments/booking/**").hasAnyAuthority(STAFF_ROLES)

                        // Rooms
                        // Public: Check room charges and availability
                        .requestMatchers(HttpMethod.GET, "/admin/room", "/admin/room/{roomNumber}", "/admin/room/type/**", "/admin/room/status/**").permitAll()
                        // Staff: Create, modify room status, or delete rooms
                        .requestMatchers(HttpMethod.POST, "/admin/room/create").hasAnyAuthority(STAFF_ROLES)
                        .requestMatchers(HttpMethod.PATCH, "/admin/room/update/**").hasAnyAuthority(STAFF_ROLES)
                        .requestMatchers(HttpMethod.DELETE, "/admin/room/delete/**").hasAnyAuthority(STAFF_ROLES)

                        // Front Desk Reception Operations
                        .requestMatchers("/reception/**", "/receptionist/**", "/checkin/**", "/checkout/**").hasAnyAuthority(STAFF_ROLES)

                        // Admin-Only Sensitive Endpoints
                        .requestMatchers("/admin/dashboard").hasAnyAuthority(ADMIN_ONLY)
                        .requestMatchers("/admin/users/**", "/admin/reports/**", "/admin/receptionist/**").hasAnyAuthority(ADMIN_ONLY)

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