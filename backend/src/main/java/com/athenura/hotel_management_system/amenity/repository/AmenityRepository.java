package com.athenura.hotel_management_system.amenity.repository;

import com.athenura.hotel_management_system.amenity.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {

    List<Amenity> findByActiveTrue();

    boolean existsByNameIgnoreCase(String name);

    Optional<Amenity> findByNameIgnoreCase(String name);
}
