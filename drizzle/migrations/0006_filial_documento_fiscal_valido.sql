CREATE OR REPLACE FUNCTION public.documento_valido(_doc text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public' AS $$
DECLARE s text := regexp_replace(coalesce(_doc,''), '\D', '', 'g'); x int; r int; t int; i int;
  w int[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
BEGIN
  IF s ~ '^(\d)\1+$' THEN RETURN false; END IF;
  IF length(s) = 11 THEN
    FOR t IN 9..10 LOOP
      x := 0; FOR i IN 1..t LOOP x := x + substr(s,i,1)::int * (t+2-i); END LOOP;
      IF ((x*10) % 11) % 10 <> substr(s,t+1,1)::int THEN RETURN false; END IF;
    END LOOP; RETURN true;
  ELSIF length(s) = 14 THEN
    FOR t IN 12..13 LOOP
      x := 0; FOR i IN 1..t LOOP x := x + substr(s,i,1)::int * w[13-t+i]; END LOOP;
      r := CASE WHEN x % 11 < 2 THEN 0 ELSE 11 - x % 11 END;
      IF r <> substr(s,t+1,1)::int THEN RETURN false; END IF;
    END LOOP; RETURN true;
  END IF;
  RETURN false;
END $$;

CREATE OR REPLACE FUNCTION public.trg_filial_documento()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.deletado_em IS NULL THEN
    IF coalesce(trim(NEW.cpf_cnpj),'') = '' THEN RAISE EXCEPTION 'CNPJ/CPF da filial é obrigatório.'; END IF;
    IF NOT public.documento_valido(NEW.cpf_cnpj) THEN RAISE EXCEPTION 'CNPJ/CPF "%" inválido (dígito verificador não confere).', NEW.cpf_cnpj; END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER filial_documento_valido BEFORE INSERT OR UPDATE ON public.filiais
FOR EACH ROW EXECUTE FUNCTION public.trg_filial_documento();

COMMENT ON COLUMN public.empresas.cpf_cnpj IS 'DEPRECATED: dados fiscais vivem somente na filial (a matriz é uma filial).';