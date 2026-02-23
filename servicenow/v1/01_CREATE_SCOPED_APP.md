# Step 1: Create Scoped Application

## Instructions

1. Log into your ServiceNow instance: https://dev275533.service-now.com/

2. In the filter navigator (left sidebar), type: **Studio**

3. Click on **System Applications > Studio**

4. Click **Create Application** button

5. Fill in the form:
   - **Name**: Sprint Pointing
   - **Scope**: sprint_pointing (it will auto-generate as `x_sprint_pointing`)
   - **Version**: 1.0.0
   - **Description**: Planning poker application for sprint refinement sessions

6. Click **Create**

7. Studio will open - this is where you'll build everything

## What This Does

Creates a scoped application that keeps all your custom code isolated and portable. The scope prefix `x_sprint_pointing` will be added to all your tables and APIs.

## Next Step

Once Studio is open, proceed to: `02_CREATE_TABLES.md`
