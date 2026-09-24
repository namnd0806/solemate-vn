ALTER FUNCTION create_order(JSONB) SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION create_order(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_order(JSONB) TO service_role;
