export ACTIVEYEAR=$1

echo $ACTIVEYEAR

createdb world-${ACTIVEYEAR}-v2

#Apply the Schema
psql -d world-${ACTIVEYEAR}-v2 -f ./schema_v2.sql

#Run the import for the two tables based on the csv file location
psql -d world-${ACTIVEYEAR}-v2 -f ./import_year.sql
