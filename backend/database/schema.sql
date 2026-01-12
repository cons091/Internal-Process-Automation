--
-- Database Schema: Internal Process Automation System
-- PostgreSQL 18+
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- =========================
-- ENUM TYPES
-- =========================

CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'USER'
);

CREATE TYPE public.request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

-- =========================
-- TABLES
-- =========================

-- Users
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role public.user_role DEFAULT 'USER',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Requests
CREATE TABLE public.requests (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status public.request_status DEFAULT 'PENDING',
    amount NUMERIC(10,2),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    CONSTRAINT fk_requests_user
        FOREIGN KEY (created_by)
        REFERENCES public.users(id)
);

-- Request Status History (Audit Log)
CREATE TABLE public.request_status_history (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    previous_status public.request_status NOT NULL,
    new_status public.request_status NOT NULL,
    changed_by INTEGER NOT NULL,
    changed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    CONSTRAINT fk_history_request
        FOREIGN KEY (request_id)
        REFERENCES public.requests(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_history_user
        FOREIGN KEY (changed_by)
        REFERENCES public.users(id)
);

-- System Configuration
CREATE TABLE public.system_config (
    key VARCHAR(50) PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    description TEXT
);

-- =========================
-- INDEXES (Performance)
-- =========================

CREATE INDEX idx_requests_status
    ON public.requests(status);

CREATE INDEX idx_requests_created_by
    ON public.requests(created_by);

CREATE INDEX idx_history_request
    ON public.request_status_history(request_id);

-- =========================
-- END OF SCHEMA
-- =========================
