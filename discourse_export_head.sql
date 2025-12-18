--
-- PostgreSQL database dump
--

\restrict BzE7qHr0faQAlRgYIKvyoxvfykJQZtnD6R3oKoE6jyHlFvEPTy8pxWedKhYWCv7

-- Dumped from database version 15.8 (Debian 15.8-1.pgdg110+1)
-- Dumped by pg_dump version 15.14 (Debian 15.14-1.pgdg12+1)

-- Started on 2025-12-18 15:11:48 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 8 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 8830 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 3440 (class 1247 OID 76329315)
-- Name: ai_moderation_setting_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ai_moderation_setting_type AS ENUM (
    'spam',
    'nsfw',
    'custom'
);


--
-- TOC entry 3245 (class 1247 OID 76328019)
-- Name: hotlinked_media_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.hotlinked_media_status AS ENUM (
    'downloaded',
    'too_large',
    'download_failed',
    'upload_create_failed'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 1705 (class 1259 OID 96951096)
-- Name: ad_plugin_house_ads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_plugin_house_ads (
    id bigint NOT NULL,
    name character varying NOT NULL,
    html text NOT NULL,
    visible_to_logged_in_users boolean DEFAULT true NOT NULL,
    visible_to_anons boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- TOC entry 1707 (class 1259 OID 96951109)
-- Name: ad_plugin_house_ads_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_plugin_house_ads_categories (
    ad_plugin_house_ad_id bigint NOT NULL,
    category_id bigint NOT NULL
);


--
-- TOC entry 1706 (class 1259 OID 96951106)
-- Name: ad_plugin_house_ads_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_plugin_house_ads_groups (
    ad_plugin_house_ad_id bigint NOT NULL,
    group_id bigint NOT NULL
);


--
-- TOC entry 1704 (class 1259 OID 96951095)
-- Name: ad_plugin_house_ads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ad_plugin_house_ads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 8831 (class 0 OID 0)
-- Dependencies: 1704
-- Name: ad_plugin_house_ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ad_plugin_house_ads_id_seq OWNED BY public.ad_plugin_house_ads.id;


--
-- TOC entry 1709 (class 1259 OID 96951138)
-- Name: ad_plugin_impressions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_plugin_impressions (
    id bigint NOT NULL,
    ad_type integer NOT NULL,
    ad_plugin_house_ad_id bigint,
    placement character varying NOT NULL,
    user_id integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    clicked_at timestamp(6) without time zone
);


--
-- TOC entry 1708 (class 1259 OID 96951137)
-- Name: ad_plugin_impressions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ad_plugin_impressions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 8832 (class 0 OID 0)
-- Dependencies: 1708
-- Name: ad_plugin_impressions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ad_plugin_impressions_id_seq OWNED BY public.ad_plugin_impressions.id;


--
-- TOC entry 1593 (class 1259 OID 76328611)
-- Name: admin_notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_notices (
    id bigint NOT NULL,
    subject integer NOT NULL,
    priority integer NOT NULL,
    identifier character varying NOT NULL,
    details json DEFAULT '{}'::json NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- TOC entry 1592 (class 1259 OID 76328610)
-- Name: admin_notices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_notices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 8833 (class 0 OID 0)
-- Dependencies: 1592
-- Name: admin_notices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
