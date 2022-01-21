# pic-sure-gic-institution

Sites must deploy a Virtual Machine inside the security boundary of their institution with the following requirements: <br>
Operating system requirement: Centos 7.x
<p><b>Minimum resources required for the application:</b> 8 cores and 32GB RAM
<p><b>Resources for loading data:</b> The resources required to load the data are determined based on the attributes of the data (number of patients, metadata per patient, annotations, etc.) and the mechanism to load the data (CSV, RDS). <br>
<p> Example:
Boston Children’s Hospital requires m5.xlarge EC2 and HEAPSIZE=51200 to load the following: <br>
* Clinical data for 2 million patients, with X variables and X observed facts in total loaded from an RDBMS using SQLLoader. 
Using the CSV loader may result in more resources being needed. 
* Genomic data for 4,000 patients, with the following annotation columns configured using the HPDS annotation pipeline to generate those annotations for 30,879,078 total variants.
Allele frequency in GNOMAD
Variant_severity from VEP
Variant_consequence from VEP

If the resources required to load your data exceed the minimum system requirements, you can spin up an additional VM dedicated to loading the data. After you are finished loading the data, then that VM can be shut off. 
Additionally if your dataset is sufficiently large that loading it would cause disruptions in query processing for your production environment, it is advised to use a separate environment to conduct loading.
Since a precise calculation to determine the resources required for loading data takes a prohibitive effort, a trial and error approach is the most practical way to determine what the loading resource environment is for any set of data. 


Follow the directions for PIC-SURE All-in-one, but use the "Create Institute Node" pipeline, instead of the "Initial Configuration Pipeline"
Each site should run as close to the same code as possible to ensure compatibility. To facilitate this, all sites should build out of the same overrides repository and the same release-control repository. This repository contains the database set-up to correctly configure the access rules. 
GIC Institute repo: https://github.com/hms-dbmi/pic-sure-gic-institution 
GIC Release Control repo: https://github.com/hms-dbmi/pic-sure-gic-institution-release-control

This is projected to take one week of effort from a full time software developer.
