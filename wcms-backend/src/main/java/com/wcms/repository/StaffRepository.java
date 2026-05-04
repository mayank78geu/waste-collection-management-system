package com.wcms.repository;

import com.wcms.entity.Staff;
import com.wcms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {
    Optional<Staff> findByUser(User user);
    boolean existsByUser(User user);
}
