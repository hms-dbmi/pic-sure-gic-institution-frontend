# pic-sure-gic-institution

Sites must deploy a Virtual Machine inside the security boundary of their institution with the following requirements: <br>
<b>Operating system requirement:</b> Centos 7.x
<p><b>Minimum resources required for the application:</b> 8 cores and 32GB RAM
<p><b>Resources for loading data:</b> The resources required to load the data are determined based on the attributes of the data (number of patients, metadata per patient, annotations, etc.) and the mechanism to load the data (CSV, RDS). <br>

  Examples:
  * If you are loading the small example datasets provided, such as 1000 patients from CDC NHANES and/or one chromosome from 1000 Genomes, then the minimum system requirements (8 vCPU, 32 GB ram) will be excessive. 

* Boston Children’s Hospital requires m5.4xlarge ec2 (16 vCPU, 64 GB ram) and HEAPSIZE=40,960 to load the following: 
  * Clinical data for 2.9 million patients, with 112,267 variables and 874,530,503 observed facts in total loaded from an RDBMS using SQLLoader. 
Using the CSV loader may result in more resources being needed. 
  * Genomic data for 4,000 patients, with the following annotation columns configured using the HPDS annotation pipeline to generate those annotations for 30,879,078 total variants.
    * Allele frequency in GNOMAD
    * Variant_severity from VEP
    * Variant_consequence from VEP


* If the resources required to load your data exceed the minimum system requirements, you can spin up an additional VM dedicated to loading the data. After you are finished loading the data, then that VM can be shut off. 
* Additionally if your dataset is sufficiently large that loading it would cause disruptions in query processing for your production environment, it is advised to use a separate environment to conduct loading.
* Since a precise calculation to determine the resources required for loading data takes a prohibitive effort, a trial and error approach is the most practical way to determine what the loading resource environment is for any set of data.


<b> PIC-SURE Installation</b><br>
Follow the directions for [PIC-SURE All-in-one](https://github.com/hms-dbmi/pic-sure-all-in-one "PIC-SURE All-in-one") Steps 1 - 4.

Step 5: In Jenkins you will see 5 tabs: All, Configuration, Deployment, PIC-SURE Builds, Supporting Jobs

Step 5a: <br> The gic-institution-release-control repository uses the new default label, 'main' instead of 'master'.  The pic-sure-all-in-one configuration still uses 'master' as the default, since that matches the majority of the older repositories.  In Jenkins, click the 'Manage Jenkins' button on the left, then select 'Configure System'. In the 'Global Properties' section, change the value of the release_control_branch to "*/main". 

Step 5b: Do not run the "Initial Configuration Pipeline". Instead run "Create Institute Node" pipeline. 


Step 6: Provide the following information:

    - AUTH0_CLIENT_ID: This is the client_id of your Auth0 Application

    - AUTH0_CLIENT_SECRET: This is the client_secret of your Auth0 Application

    - AUTH0_TENANT: This is the first part of your Auth0 domain, for example if your domain is avillachlab.auth0.com you would   enter avillachlab in this field.

    - EMAIL: This is the Google account that will be the initial admin user.

    - PROJECT_SPECIFIC_OVERRIDE_REPOSITORY: This is the repo that contains the project specific overrides for the GIC project: https://github.com/hms-dbmi/pic-sure-gic-institution 

    - RELEASE_CONTROL_REPOSITORY: This is the repo that contains the build-spec.json file for the GIC project. This file controls what code is built and deployed: https://github.com/hms-dbmi/pic-sure-gic-institution-release-control

Note: Ensure none of these fields contain leading or trailing whitespace, the values must be exact.

<p>Continue to follow the remaining steps in the PIC-SURE All-in-one.</p> 


<p>Note: The PIC-SURE installation takes on average one week of effort from a full time software developer or systems admin. </p>
