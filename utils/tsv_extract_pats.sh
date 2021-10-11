#!/bin/bash

###################################################################
# This script is used to extract patients from TSV file(s) and
# output the unqiue sorted list into a CSV file for HPDS import
###################################################################
VCF_DIR=/usr/local/docker-config/vcfLoad
OUTFILE=/tmp/vcf_pats.csv
OUTFILE2=/tmp/vcf_pats2.csv
DATE=`date +%Y-%m-%d`

rm -f $OUTFILE
rm -f $OUTFILE2

for f in ${VCF_DIR}/*.tsv; do
	sed -rn "2,\$s/^(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\t(.*?)\$/\6/p" $f \
		| sed -r "s/,/\n/g" \
		| sed -r "s/^(.*)\$/\1,\"\\\\Genomic Data\\\\\",,TRUE,$DATE/g" >> $OUTFILE
done

echo -e "PATIENT_NUM,CONCEPT_PATH,NVAL_NUM,TVAL_CHAR,START_DATE" > $OUTFILE2
cat $OUTFILE | sort -n | uniq >> $OUTFILE2
mv $OUTFILE2 $OUTFILE

echo "Complete. Output file=${OUTFILE}"
