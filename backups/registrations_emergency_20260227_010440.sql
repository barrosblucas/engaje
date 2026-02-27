--
-- PostgreSQL database dump
--

\restrict 0Xeynyw4stvD9h5UgBcEyFBetaHdV2rmtfZVyukaOQeYaL3NDH1ApVDdb0lqUzo

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

--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registrations (id, event_id, user_id, protocol_number, status, created_at, cancelled_at, form_data) FROM stdin;
cmm438cyq0002l6dmn4o6ymnz	cmm169rtz0001l6zwic6vab6q	cmm437uwd0000l6dmjtk7sayb	EVT-20260226-WL54G	confirmed	2026-02-26 23:21:55.107	\N	{"tamanho_camiseta": "m"}
cmm43cqeu0008l6dm8pqyasbo	cmm169rtz0001l6zwic6vab6q	cmm3i85ac009ll6doc7m1csho	EVT-20260226-N821X	confirmed	2026-02-26 23:25:19.158	\N	{"tamanho_camiseta": "m"}
cmm453lry000dl6dmp8b8191i	cmm169rtz0001l6zwic6vab6q	cmm452nkw000bl6dmft6kxua5	EVT-20260227-IPJKY	confirmed	2026-02-27 00:14:12.479	\N	{"tamanho_camiseta": "m"}
cmm459u8v000gl6dmd3396qk2	cmm169rtz0001l6zwic6vab6q	cmm458gpn000el6dm44cej7q1	EVT-20260227-E63R2	confirmed	2026-02-27 00:19:03.391	\N	{"tamanho_camiseta": "m"}
cmm467xff000ll6dmwf6ahtri	cmm169rtz0001l6zwic6vab6q	cmm466bef000jl6dmt37242m9	EVT-20260227-F26YT	confirmed	2026-02-27 00:45:33.819	\N	{"tamanho_camiseta": "g"}
cmm46dws3000ol6dm7r0elzoa	cmm169rtz0001l6zwic6vab6q	cmm46d252000ml6dm51edl60a	EVT-20260227-NWFXR	confirmed	2026-02-27 00:50:12.916	\N	{"tamanho_camiseta": "m"}
\.


--
-- PostgreSQL database dump complete
--

\unrestrict 0Xeynyw4stvD9h5UgBcEyFBetaHdV2rmtfZVyukaOQeYaL3NDH1ApVDdb0lqUzo

