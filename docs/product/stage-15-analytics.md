# Etapa 15: analítica y reportería

Las métricas se procesan incrementalmente hacia un modelo diario gobernado. El dashboard y el endpoint de dataset consultan esta capa, no agregaciones dispersas sobre tablas transaccionales. El endpoint conserva RLS y está preparado para un conector Power BI con identidad dedicada.
