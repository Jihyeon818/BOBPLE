package kr.bit.bobple.repository;


import kr.bit.bobple.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // 이메일로 사용자를 찾는 메서드 (추가)
}