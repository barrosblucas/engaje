--
-- PostgreSQL database dump
--

\restrict SIWV2hpKCUnYdhYuNoBrdiHS2rU9WV2wXtVxxxB7Zz00a5nu5ectJidmbMFanNL

-- Dumped from database version 18.1 (Ubuntu 18.1-1.pgdg25.04+2)
-- Dumped by pg_dump version 18.1 (Ubuntu 18.1-1.pgdg25.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrations (
    id text NOT NULL,
    event_id text NOT NULL,
    user_id text NOT NULL,
    protocol_number text NOT NULL,
    status public."RegistrationStatus" DEFAULT 'confirmed'::public."RegistrationStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cancelled_at timestamp(3) without time zone,
    form_data jsonb
);


ALTER TABLE public.registrations OWNER TO postgres;

--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registrations (id, event_id, user_id, protocol_number, status, created_at, cancelled_at, form_data) FROM stdin;
cmm438cyq0002l6dmn4o6ymnz	cmm169rtz0001l6zwic6vab6q	cmm437uwd0000l6dmjtk7sayb	EVT-20260226-WL54G	confirmed	2026-02-26 23:21:55.107	\N	{"tamanho_camiseta": "m"}
\.


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: registrations_event_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_event_id_idx ON public.registrations USING btree (event_id);


--
-- Name: registrations_event_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX registrations_event_id_user_id_key ON public.registrations USING btree (event_id, user_id);


--
-- Name: registrations_protocol_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_protocol_number_idx ON public.registrations USING btree (protocol_number);


--
-- Name: registrations_protocol_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX registrations_protocol_number_key ON public.registrations USING btree (protocol_number);


--
-- Name: registrations registrations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: registrations registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict SIWV2hpKCUnYdhYuNoBrdiHS2rU9WV2wXtVxxxB7Zz00a5nu5ectJidmbMFanNL

