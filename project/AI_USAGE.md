## A feladat megoldása során végig ChatGPT 5.1-et használtam a következő sorokban látható promptok segítségével:

### 1/ Projekt elkezdése + mapping_service:

"
You are a full-stack developer. I am creating a microservice project: frontend (react), mapping_service (python with flask), validation_service (node.js), i don't need a database, I will store every item in memory. First create the mapping service with the following information: I need a basic api service with flask api, POST /mapping/suggest - AI generated suggestions , POST /mapping/transform - make the transformation with AI (mappingPrompt = Given these two data structures: SOURCE FORMAT: ${JSON.stringify(sourceFormat, null, 2)} TARGET FORMAT: ${JSON.stringify(targetFormat, null, 2)} Generate field mappings with: 1. Source path -> Target path 2. Transformation needed (if any) 3. Confidence score (0-1) Return as JSON array. ;), GET /mapping/templates - list saved mappings. I want to use openai for the generations.
"

### 2/ Ez már önmagában egy használható megoldást adott, viszont átláthatóság szempontjából nem volt a legjobb, mivel mindent egy fájlba sűrített, ezért a következő prompt-om ez volt:

"
drop the functions into a utility folder for cleaner look
"

### 3/ Ezek után történt meg az első commit, éppen ezért generáltattam vele egy általános gitignore fájlt:

"
kérek egy általános gitignore-t python, node.js és react-hez
"

### 4/ A következő a validation_service volt:

"
next service will be the node.js validation service, I need a simple node.js service with the following apis: transformed data validation - POST /validate - simple business rules (like: age > 18) - format check, list active rules - GET /validate/rules, I need openai integration for the validation rules generation
"

### 5/ A projekt harmadik nagy része a frontend volt, amit a következő prompt segítségével sikerült generálnom:

"
lets continue with the final part the React + TS frontend where I want to create a modern looking simple website: 1 menu for mapping and 1 menu for validation. Mapping - suggest, get templates, transform. Validation - validate, get rules
"

### 6/ A front-on elég kicsik voltak az input mezők, ezért meg kellett növelni:

"
on the frontend every input field should be bigger and more visible because the json formats
"

## AI hibák és javítások:

Majdnem mindent sikerült hiba és utólagos korrigálás nélkül megoldani, kizárólag ezekkel találkoztam:
- a mapping és validation service-nél a .env-ből való importok nem működtek, ezt utólagosan kellett beleírni a kódba (servicenként 1-1 sor)
- a front-on annyi hibába ütköztem, hogy a projekt létrehozásakor a Vite miatt errort kaptam az importoknál, ezért néhány import-ba bele kellett írnom a "type"-ot.

## Időmegtakarítás:

Egy ekkora volumenű projekt biztosan igényelt volna 1-2 napot, de AI segítségével sikerült 2 órán belül végeznem vele, kisebb szüneteket hagyva utólagos ellenőrzésekre.