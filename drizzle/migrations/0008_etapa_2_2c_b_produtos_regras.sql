CREATE OR REPLACE FUNCTION public.tipo_unidade_codigo(_grupo uuid, _codigo varchar)
RETURNS varchar LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE v varchar;
BEGIN
  SELECT tipo INTO v FROM public.unidades_medida WHERE grupo_id = _grupo AND upper(codigo) = upper(_codigo) AND deletado_em IS NULL LIMIT 1;
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.unidade_base_do_tipo(_tipo varchar)
RETURNS varchar LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF _tipo = 'PESO' THEN RETURN 'KG'; END IF;
  IF _tipo = 'VOLUME' THEN RETURN 'LT'; END IF;
  RETURN 'UND';
END $$;

CREATE OR REPLACE FUNCTION public.trg_produto_unidades_padrao()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.deletado_em IS NOT NULL THEN RETURN NEW; END IF;
  IF upper(NEW.unidade_base) <> public.unidade_base_do_tipo(NEW.tipo_unidade) THEN
    RAISE EXCEPTION 'Unidade base "%" não corresponde ao tipo % (PESO=KG, VOLUME=LT, UNIDADE=UND).', NEW.unidade_base, NEW.tipo_unidade;
  END IF;
  IF NEW.unidade_entrada_padrao IS NOT NULL AND public.tipo_unidade_codigo(NEW.grupo_id, NEW.unidade_entrada_padrao) IS DISTINCT FROM NEW.tipo_unidade THEN
    RAISE EXCEPTION 'Unidade de entrada "%" não é do tipo % do produto — conversão entre tipos diferentes é proibida.', NEW.unidade_entrada_padrao, NEW.tipo_unidade;
  END IF;
  IF NEW.unidade_saida_padrao IS NOT NULL AND public.tipo_unidade_codigo(NEW.grupo_id, NEW.unidade_saida_padrao) IS DISTINCT FROM NEW.tipo_unidade THEN
    RAISE EXCEPTION 'Unidade de saída "%" não é do tipo % do produto — conversão entre tipos diferentes é proibida.', NEW.unidade_saida_padrao, NEW.tipo_unidade;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER produto_unidades_padrao BEFORE INSERT OR UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.trg_produto_unidades_padrao();

CREATE OR REPLACE FUNCTION public.trg_produto_unidade_tipo()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE p public.produtos%ROWTYPE; t varchar;
BEGIN
  IF NEW.deletado_em IS NOT NULL THEN RETURN NEW; END IF;
  SELECT * INTO p FROM public.produtos WHERE id = NEW.produto_id;
  t := public.tipo_unidade_codigo(p.grupo_id, NEW.unidade_codigo);
  IF t IS NULL THEN RAISE EXCEPTION 'Unidade "%" não cadastrada.', NEW.unidade_codigo; END IF;
  IF t <> p.tipo_unidade THEN
    RAISE EXCEPTION 'Unidade "%" é do tipo %, mas o produto "%" é do tipo % — conversão entre tipos diferentes é proibida.', NEW.unidade_codigo, t, p.descricao, p.tipo_unidade;
  END IF;
  IF upper(NEW.unidade_codigo) = upper(p.unidade_base) AND NEW.fator_base <> 1 THEN
    RAISE EXCEPTION 'A unidade base (%) tem fator 1 por definição.', p.unidade_base;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER produto_unidade_tipo BEFORE INSERT OR UPDATE ON public.produto_unidades
  FOR EACH ROW EXECUTE FUNCTION public.trg_produto_unidade_tipo();

CREATE OR REPLACE FUNCTION public.fator_base(_produto_id uuid, _unidade character varying)
RETURNS numeric LANGUAGE plpgsql STABLE SET search_path TO 'public' AS $$
DECLARE v numeric; p record; t varchar;
BEGIN
  SELECT * INTO p FROM public.produtos WHERE id = _produto_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado para conversão de unidade.'; END IF;
  IF upper(_unidade) = upper(p.unidade_base) THEN RETURN 1; END IF;
  t := public.tipo_unidade_codigo(p.grupo_id, _unidade);
  IF t IS NOT NULL AND t <> p.tipo_unidade THEN
    RAISE EXCEPTION 'Unidade "%" (%) não pode ser usada no produto "%" (%) — tipos diferentes.', _unidade, t, p.descricao, p.tipo_unidade;
  END IF;
  SELECT fator_base INTO v FROM public.produto_unidades WHERE produto_id = _produto_id AND upper(unidade_codigo) = upper(_unidade) AND deletado_em IS NULL;
  IF v IS NOT NULL THEN RETURN v; END IF;
  RAISE EXCEPTION 'Unidade "%" não está configurada no produto "%".', _unidade, p.descricao;
END $$;

CREATE OR REPLACE FUNCTION public.ie_valida(_ie text, _uf text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE t text := trim(coalesce(_ie,'')); d text; s int := 0; w int[] := ARRAY[3,2,9,8,7,6,5,4,3,2]; r int; i int;
BEGIN
  IF t = '' OR upper(t) = 'ISENTO' THEN RETURN true; END IF;
  IF t ~ '[^0-9./ -]' THEN RETURN false; END IF;
  d := regexp_replace(t, '\D', '', 'g');
  IF upper(coalesce(_uf,'')) = 'MT' THEN
    IF length(d) < 9 OR length(d) > 11 THEN RETURN false; END IF;
    d := lpad(d, 11, '0');
    IF d ~ '^(\d)\1+$' THEN RETURN false; END IF;
    FOR i IN 1..10 LOOP s := s + substr(d,i,1)::int * w[i]; END LOOP;
    r := 11 - (s % 11);
    IF r >= 10 THEN r := 0; END IF;
    RETURN r = substr(d,11,1)::int;
  END IF;
  RETURN length(d) BETWEEN 8 AND 14;
END $$;

CREATE OR REPLACE FUNCTION public.trg_filial_documento()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.deletado_em IS NULL THEN
    IF coalesce(trim(NEW.cpf_cnpj),'') = '' THEN RAISE EXCEPTION 'CNPJ/CPF da filial é obrigatório.'; END IF;
    IF NOT public.documento_valido(NEW.cpf_cnpj) THEN RAISE EXCEPTION 'CNPJ/CPF "%" inválido (dígito verificador não confere).', NEW.cpf_cnpj; END IF;
    IF NOT public.ie_valida(NEW.inscricao_estadual, NEW.estado) THEN
      RAISE EXCEPTION 'Inscrição Estadual "%" inválida para %.', NEW.inscricao_estadual, coalesce(NEW.estado, 'a UF');
    END IF;
  END IF;
  RETURN NEW;
END $$;