package com.project.dawker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.dawker.entity.daw_specific.ConfigEntity;
import com.project.dawker.entity.daw_specific.DawEntity;

@Repository
public interface ConfigRepository extends JpaRepository<ConfigEntity, Long> {

    Optional<ConfigEntity> findById(Long configId);
}
