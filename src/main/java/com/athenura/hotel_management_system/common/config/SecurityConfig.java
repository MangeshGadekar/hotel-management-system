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

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/admin/room", "/admin/room/{roomNumber}", "/admin/room/type/**", "/admin/room/status/**").permitAll()


                        .requestMatchers("/booking/create").permitAll()


                        .requestMatchers("/admin/users/**", "/admin/reports/**").hasRole("ADMIN")


                        .requestMatchers(HttpMethod.POST, "/admin/room/create").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/admin/room/update/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/admin/room/delete/**").hasAnyRole("ADMIN", "RECEPTIONIST")


                        .requestMatchers("/booking/cancel/**", "/booking/my-bookings").hasAnyRole("ADMIN", "RECEPTIONIST", "GUEST")
                        .requestMatchers("/booking/update/**", "/booking").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers("/booking/{id}").hasAnyRole("ADMIN", "RECEPTIONIST", "GUEST")


                        .requestMatchers("/guest/my-profile", "/guest/update-profile").hasRole("GUEST")
                        .requestMatchers("/guest/**").hasAnyRole("ADMIN", "RECEPTIONIST")


                        .requestMatchers("/reception/**", "/checkin/**", "/checkout/**").hasAnyRole("ADMIN", "RECEPTIONIST")

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