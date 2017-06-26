\set year `echo $ACTIVEYEAR`

\set root /data/osm-analysis/tsv/

\set tiles :root :year '-users-per-tile-slim-planet.csv'
\set users :root :year '-user_data-slim-planet.tsv'

\echo :'tiles'
\echo :'users'

create function copyintiles( _tableArg text, _filename text )
returns void
language plpgsql as $this$
declare sql text;
begin
  sql := 'COPY ' || _tableArg  || ' FROM ' || quote_literal(_filename) || ' CSV';
  execute sql;
  return;
end;
$this$;


SELECT copyintiles('per_tile(quadkey, year, uid, buildings, road_km, amenities, edits, active_days)', :'tiles' );


create function copyinuserdata( _tableArg text, _filename text )
returns void
language plpgsql as $this$
declare sql text;
begin
  sql := 'COPY ' || _tableArg  || ' FROM ' || quote_literal(_filename);
  execute sql;
  return;
end;
$this$;

SELECT copyinuserdata('user_stats(uid, name, year, buildings, road_km, amenities, edits, active_days)', :'users');
