package kr.bit.bobple.config;

import jakarta.servlet.http.HttpServletResponse;
import kr.bit.bobple.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository; // 추가


    public SecurityConfig(JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository; // 추가
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults()) // CORS 설정 적용
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers(request -> CorsUtils.isPreFlightRequest(request)).permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/recipes/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/recipes/**").authenticated()
                                .requestMatchers(HttpMethod.PUT, "/api/recipes/{recipeId}").authenticated()
                                .requestMatchers(HttpMethod.DELETE, "/api/recipes/**").authenticated()
                                .requestMatchers("http://localhost:8080/api/recipes/ai-recommendation").permitAll()
                                .requestMatchers("http://localhost:8080/api/recommend-recipes").permitAll()
                                .requestMatchers("/api/recipes/search").permitAll()
                                .requestMatchers("/api/recipes/{recipeId}/comments", "/api/notifications").permitAll() // 댓글 조회도 인증 없이 허용
                                .requestMatchers("/api/recipes/{recipeId}/comments/{commentId}").authenticated() // 레시피 생성, 댓글 작성 등은 인증 필요
                                .requestMatchers("/api/**", "/myPage/**", "/login/**", "/login/oauth2/callback/**", "/", "form/**", "/api/recipes/**", "/pointShop/**", "form/**", "/api/users/update", "/api/users/**", "/api/admin/*", "api/questions/**").permitAll()
                                .requestMatchers("/api/**","/api/chatrooms/**","/api/chatrooms/my/**").authenticated()  // /api/chatrooms/** 경로는 인증 필요
                                .requestMatchers("/api/recipes/search","/api/recipes/recommend","/api/recipes/latest","/api/recipes/{id}/increment-views").permitAll()// AI 레시피 추천 엔드포인트 허용
                                .requestMatchers(HttpMethod.GET, "/api/users/me", "/api/chatrooms/{chatRoomId}/joinedAt").authenticated() // /api/user/me 경로는 인증 필요
                                .requestMatchers("/api/**","/api/chatrooms/{chatRoomId}/messages", "api/chatrooms/${numericChatRoomId}/messages", "api/messages/${messageId}/unread-count", "api/chatrooms/${chatRoomId}/role", "/join/{chatRoomId}/joinedAt").authenticated()
                                .requestMatchers("/api//recipes-images/upload").authenticated()
                                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                                .anyRequest().authenticated()
                )
                .httpBasic(AbstractHttpConfigurer::disable)
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userRepository), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((request, response, accessDeniedException) -> response.sendError(HttpServletResponse.SC_FORBIDDEN))
                );

        return http.build();
    }

    @Bean
    @Order(99)
    public SecurityFilterChain actuatorSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/actuator/**")
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(withDefaults())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/actuator/**").authenticated()
                )
                .exceptionHandling(exception -> exception
                        .accessDeniedHandler((request, response, accessDeniedException) -> response.sendError(HttpServletResponse.SC_FORBIDDEN))
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedHeader("*");
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeHttpRequests(authorizeRequests ->
//                        authorizeRequests
//                                .requestMatchers("/myPage", "/login/**", "/login/oauth2/callback/kakao", "/").permitAll()
//                                .anyRequest().authenticated()
//                )
//                .oauth2Login(oauth2Login ->
//                        oauth2Login
//                                .loginPage("/login")
//                                .defaultSuccessUrl("/", true)
//                                .failureUrl("/login?error=true")
//                );
//        return http.build();
//    }
}
