function button_press_function (docFieldContents, acronymFieldContents, blacklistFieldContents) {
    //function gets called when the "run" button is pressed
    //console.log("button pressed");
    //clean up field contents by turning all page breaks and tabs into spaces
    var clean_doc = docFieldContents.split("\n").join(' ');
    clean_doc = clean_doc.split("\t").join(' ');
    var clean_acronym = acronymFieldContents.split("\n").join(' ');
    clean_acronym = clean_acronym.split("\t").join(' ');
    var clean_blacklist = blacklistFieldContents.split(" ").join('\n');
    clean_blacklist = clean_blacklist.split("\t").join('\n');
    var acronym_by_acronym;
    acronym_by_acronym = clean_acronym.split(' ');
    var doc_by_word;
    doc_by_word = clean_doc.split(" ");
    var organized_words = "";
    var whitelist = [];
    var clean_whitelist = [];
   

    //make blacklist
    clean_blacklist = remove_punctuation(clean_blacklist);
    if (clean_blacklist == "FQS") {
        //this is my standard FQS blacklist and should not be used by other people
        clean_blacklist = make_FQS_blacklist();
    }

    if (clean_blacklist == "") {
//this is the regular blacklist, which is less strict but removes things like long words and Roman numerals
        clean_blacklist = standard_blacklist();

    }

    //if nothing is in input in the blacklist field, it defaults to the standard blacklist, which you can find below
    //right before the FQS blacklist
    //I'm not sure I ever tested if the blacklist works before I added the standards blacklist but I'd say
    //even if it did, it's less likely to work now that I've added a standard blacklist. Now sure anyone used that feature
    //I think by making the elif above, it means if you put something in the blacklist box, it's maintain, but if you don't,
    //then it inputs the standards list

    //find acronyms missing from appendix
    for (word_index = 0; word_index < doc_by_word.length; word_index++) {

        var actual_word = doc_by_word[word_index];
        var remove_punct = remove_punctuation(actual_word);
        var word_without_parens = remove_paren(remove_punct);
        upper_or_not = is_upper_case(word_without_parens);
        clean_whitelist = standard_whitelist();
        //console.log(clean_whitelist)
        //console.log(upper_or_not)
        let in_whitelist = clean_whitelist.indexOf(word_without_parens);
        //console.log(in_whitelist);
        var check_whitelist;
        check_whitelist = already_in_list(word_without_parens, clean_whitelist);
        //console.log("value of check_whitelist is: ");
        //console.log(check_whitelist);

        //if the given word is an acronym or in the whitelist...
        if ((upper_or_not == true) || (check_whitelist == true)) {
           
            var acronym_without_s = remove_s(word_without_parens);
            //remove_s has a built-in exception for SoCalGas but will remove other lowercase esses

            var no_paren = remove_paren(acronym_without_s);

            //check that it's not in the appendix
            var exists_already = already_in_appendix(no_paren, acronym_by_acronym);
            //does the version of the word with no parentheses appear in the acronym appendix
            //true = yes, false = no

            if (exists_already == false) {
                //if it is not already in the acronym list
                var in_dictionary = already_in_list(no_paren, organized_words);
                //check that it's not already in our list of unfound acronyms
                if (in_dictionary == false) {
                    var in_blacklist = already_in_list(no_paren, clean_blacklist);
                    //check that it's not in the blacklist
                    if (in_blacklist == false) {
                        no_paren_length = no_paren.length;

                        if (no_paren_length > 1) {
                            //do not add single characters (like A or I) to the missed acronym list

                            //need to check that the last character isn't a weird curved apostrophe / is a letter
                            var cleaned_word = remove_bad_last_char(no_paren);

                            var second_in_dictionary = already_in_list(cleaned_word, organized_words)
                           
                            //I'm checking again whether it is in the list because some words were appearing multiple times, but
                            //there are still words that are in the appendix and still appear in the final acronym list... specifically
                            //words that have a weird apostrophe at the end (which has now been stripped)

                            //I see, organized words is JUST the acronyms, not the appendix list
                            //need to check the appendix list
                            var second_exists_already = already_in_appendix(cleaned_word, acronym_by_acronym)


                            //I could not tell you why we need to check these things again but if you don't, it don't work!
                            if ((second_in_dictionary == false) & (second_exists_already == false)) {
                                console.log("reached inner sanctum");
                                organized_words += cleaned_word;
                                organized_words += "\n";
                                //add it to organized_words, the list of all acronyms missing from the appendix
                                //it will be returned at the end of the function

                            }


                        }
                    }      
                }
            }  
        }
    }

    //ensure acronyms from appendix are all referenced in text
    var used_once = '';
    var used_many_times = '';
    var not_used = '';

    //this for loop is about checking the acronym appendix, now the text for acronyms
    for (word_index = 0; word_index < doc_by_word.length; word_index++) {
        var actual_word = doc_by_word[word_index];
        var remove_punct = remove_punctuation(actual_word);
        var word_without_parens = remove_paren(remove_punct);
        upper_or_not = is_upper_case(word_without_parens);
        //clean up the word



        //determine if a word is an acronym
        if ((upper_or_not == true) || (check_whitelist == true)) {
            //console.log("actual word is:")
            //console.log(actual_word)
            var acronym_without_s = remove_s(word_without_parens);
            var no_paren = remove_paren(acronym_without_s);
            var exists_already = already_in_appendix(no_paren, acronym_by_acronym);

            //check that it's in the appendix.
            if (exists_already == true) {
                var exists_multiple_times = already_in_list(no_paren, used_once);
                var in_used_many_times = already_in_list(no_paren, used_many_times);
                //check whether this is the first time we've found this acronym
                //or whether we've already added it to the used_once list, in which case
                //we put it in the used_many_times list

                if (exists_multiple_times == false) {
                    //the word is not already in used_once
                    used_once += no_paren + "\n";
                    //console.log("used once contains:")
                    //console.log(used_once)
                }

                else if (in_used_many_times == false) {
                    used_many_times += no_paren + "\n";
                    //console.log("used many times contains:")
                    //console.log(used_many_times)
                    //every item in this list will presumably also be in the used_once list
                }
            }
        }
    }

//need to strip out ’ this symbol from acronyms before they are published in the table

//socalgas becomes SoCalGa because the S gets stripped out

    for (acronym_index = 0; acronym_index < acronym_by_acronym.length; acronym_index++) {
        var acronym = acronym_by_acronym[acronym_index];
        var in_used_once = already_in_list(acronym, used_once);
        if (in_used_once == false) {
            not_used += acronym + "\n";
        }
    }

    //CHECK POINT
    //every acronym from the appendix used multiple times in text is in used_many times
    //every acronym used one or more times is in used_once
    //every acronym from the appendix not used in text is in not_used
    //I am aware a dictionary would've done this much more efficiently but I didn't want to make an object :/

    var better_used_once = '';
    var used_once_split = used_once.split('\n');
    //this list will eventually contain only acronyms used once, not once or more

    for (acronym_index = 0; acronym_index < used_once_split.length; acronym_index++) {
        var acronym = used_once_split[acronym_index];
        var in_used_once = already_in_list(acronym, used_many_times);
        //check if the item in used_once is also in used_many_times (i.e., it was used more than once)

        if (in_used_once == false) {
            better_used_once += acronym + "\n";
            //add those that aren't to better_used_once
        }
    }
    var new_acronym_split = organized_words.split("\n");
    new_acronym_split.sort();
    //split each entry from organized_words onto new lines and alphabetize it
    var acronym_with_breaks = [];

    for (acronym = 0; acronym < new_acronym_split.length; acronym++) {

        if (new_acronym_split[acronym] != "undefined") {

            if (new_acronym_split[acronym] != "") {
                acronym_with_breaks += new_acronym_split[acronym];
                acronym_with_breaks += "\n";
            }
        }
    }
    var outputString = acronym_with_breaks;
    combined_list = [];
    var not_used_split = not_used.split('\n');
    var better_used_once_split = better_used_once.split('\n');
    var used_many_times_split = used_many_times.split('\n');
    not_used_split.sort();
    better_used_once_split.sort();
    used_many_times_split.sort();

    //show user how many times each acronym was used, alphabetized within sections
    //so all the unused acronyms appear first with a message explaining they were not used in text
    for (acronym = 0; acronym < not_used_split.length; acronym++) {

        if (not_used_split[acronym] != "") {
            combined_list += not_used_split[acronym] + " was NOT used in the text\n";
        }
    }
    //add a break between the sections to aid in reading
    combined_list += "\n"

    for (acronym = 0; acronym < better_used_once_split.length; acronym++) {
        if (better_used_once_split[acronym] != "") {
            combined_list += better_used_once_split[acronym] + " was used in the text ONLY ONCE\n";
        }
    }
    combined_list += "\n"

    for (acronym = 0; acronym < used_many_times_split.length; acronym++) {
        if (used_many_times_split[acronym] != "") {
            combined_list += used_many_times_split[acronym] + " was used multiple times in the text\n";
        }
    }
    combined_list += "\n"

    //make final array to return to the output boxes
        var return_array = [outputString, combined_list];

        var suggested_definitions = create_definitions_table(return_array, common_definitions);
    //now that we have our list of all acronyms, we can also create a table that tries to define them
    //and makes them easier to copy-paste.

    return (return_array);
}



const common_definitions = {

    "AAM" : "After-Action Meeting",
"AAR" : "After-Action Report",
"ADA" : "Americans with Disabilities Act",
"AEP" : "Ambulance Exchange Point",
"AGC" : "Automatic Generation Control",
"AI" : "Artificial Intelligence",
"ALS" : "Advanced Life Support",
"APA" : "Administrative Procedures Act",
"APPA" : "American Public Power Association",
"ATO" : "Administrative Time Off",
"BA" : "Balancing Authority",
"BES" : "Bulk Electric System",
"BIA" : "Business Impact Analysis",
"BLS" : "Basic Life Support",
"BPA" : "Business Process Analysis",
"CAISO" : "California Independent System Operator",
"Cal OES" : "California Governor’s Office of Emergency Management",
"CARB" : "California Air Resources Board",
"CBF" : "Critical Business Function",
"CCP" : "Casualty Collection Point",
"CCTA" : "Complex, Coordinated Terrorist Attack",
"CDC" : "Centers for Disease Control and Prevention",
"CDL" : "Commercial Driver's License",
"CEA" : "Career Executive Assignment",
"CEC" : "California Energy Commission",
"CEMP" : "Comprehensive Emergency Management Plan ",
"CFR" : "Code of Federal Regulation",
"CISA" : "Cybersecurity and Infrastructure Security Agency",
"CNRA" : "California Natural Resources Agency ",
"COG" : "Continuity of Government",
"COOP" : "Continuity of Operations",
"COVID-19" : "Coronavirus 2019",
"CPUC" : "California Public Utilities Commission",
"CTN" : "Critical Transportation Needs",
"CUEA" : "California Utilities Emergency Association",
"DAFN" : "Disabilities and Access and Functional Needs ",
"DDoS" : "Distributed Denial of Service",
"DER" : "Distributed Energy Resource",
"DGS" : "California Department of General Services",
"DOE" : "United State Department of Energy",
"DPW" : "Department of Public Works",
"DSS" : "Department of Social Services",
"DSW" : "Disaster Service Worker ",
"DWR" : "California Department of Water Resources ",
"EAP" : "Employee Assistance Program",
"EEA" : "Emergency Energy Alert",
"EEG" : "Exercise Evaluation Guide",
"EEI" : "Edison Electric Institute",
"EGCC" : "Energy Government Coordinating Council",
"EIA" : "United States Energy Information Administration",
"E-ISAC" : "Electricity Information Sharing and Analysis Center",
"EMS" : "Emergency Medical Services",
"EMT" : "Emergency Medical Technician",
"EOC" : "Emergency Operations Center",
"EOP" : "Emergency Operations Plan",
"EPA" : "Environmental Protection Agency",
"EPRI" : "Electric Power Research Institute",
"EPT" : "Exercise Planning Team",
"ERCOT" : "Electric Reliability Council of Texas",
"ESA" : "Essential Supporting Activity",
"ESCC" : "Electricity Subsector Coordinating Council",
"ESF" : "Emergency Support Function",
"EUP" : "Electrical Undergrounding Plan",
"ExPlan" : "Exercise Plan",
"FAC" : "Family Assistance Center",
"FDEM" : "Florida Division of Emergency Management",
"FDLE" : "Florida Department of Law Enforcement",
"FE" : "Functional Exercise",
"FEMA" : "Federal Emergency Management Agency",
"FERC" : "Federal Energy Regulatory Commission",
"FIRM" : "Flood Insurance Rate Map",
"FMCSA" : "Federal Motor Carrier Safety Administration",
"FPM" : "Final Planning Meeting",
"FRC" : "Family Reunification Center",
"FRES" : "Fire Rescue Emergency Services",
"FSAP" : "Fuels Set-Aside Program",
"FSE" : "Full-Scale Exercise",
"GIS" : "Geographic Information System",
"HIFLD" : "Homeland Infrastructure Foundation-Level Data",
"HR" : "Human Resources",
"HSEEP" : "Homeland Security Exercise and Evaluation Program",
"HSPD" : "Homeland Security Presidential Directive",
"HVAC" : "Heating, Ventilation, and Air Conditioning",
"IAP" : "Incident Action Plan",
"IC" : "Incident Commander",
"ICCP" : "Inter-Control Center Communications Protocol",
"IED" : "Improvised Explosive Device",
"IPM" : "Initial Planning Meeting",
"IROL" : "Interconnection Reliability Operating Limit",
"IRS" : "Internal Revenue Service",
"ISER" : "Infrastructure Security and Energy Restoration Division",
"ISO" : "Independent System Operator",
"IT" : "Information Technology ",
"JD" : "Juris Doctor",
"JIC" : "Joint Information Center",
"JIS" : "Joint Information System",
"JTTF" : "Joint Terrorism Task Force",
"LEP" : "Limited English Proficiency",
"LPR" : "License Plate Reader",
"M&I" : "Municipal and Industrial",
"MHOAC" : "Medical Health Operational Area Coordinator",
"MOC" : "Medical Operations Center",
"MOU" : "Memorandum of Understanding",
"MPM" : "Midterm Planning Meeting",
"MRE" : "Meals, Ready-to-Eat",
"MSEL" : "Master Scenario Events List",
"MTS" : "Metropolitan Train System",
"N/A" : "Not Applicable ",
"NASEO" : "National Association of State Energy Officials",
"NCB" : "Non-Competitively Bid",
"NCTD" : "North County Transit District",
"NERC" : "North American Electric Reliability Corporation",
"NFIP" : "National Flood Insurance Program",
"NGL" : "Natural Gas Liquid",
"NGO" : "Non-Governmental Organization",
"NIMS" : "National Incident Management System",
"NOAA" : "National Oceanic and Atmospheric Administration",
"NRECA" : "National Rural Electric Cooperative Association",
"NYC" : "New York City",
"NYS" : "New York State",
"OA" : "Operational Area",
"OAL" : "Office of Administrative Law",
"OEM" : "Office of Emergency Management",
"OES" : "Office of Emergency Services",
"OLS" : "Office of Legal Services",
"OSHA" : "Occupational Safety and Health Administration ",
"PACE" : "Primary, Alternate, Contingency, and Emergency",
"PDS" : "Planning and Development Services",
"PG&E" : "Pacific Gas and Electric ",
"PII" : "Personally Identifiable Information ",
"PIO" : "Public Information Officer",
"POD" : "Point of Distribution",
"POETE" : "Planning, Organizing, Equipping, Training, and Exercising",
"PPD" : "Presidential Policy Directive",
"PPE" : "Personal Protective Equipment",
"PSAP" : "Public Safety Answering Point",
"PSPS" : "Public Safety Power Shutoff ",
"RAMP" : "Risk Assessment and Mitigation Phase ",
"RBOB" : "Reformulated Blendstock for Oxygenate Blending",
"RC" : "Reliability Coordinator",
"RCWG" : "Resilient Communications Working Group",
"RDSTF" : "Regional Domestic Security Task Force",
"RPO" : "Recovery Point Objective",
"RTF" : "Rescue Task Force",
"RTO" : "Recovery Time Objective",
"RTU" : "Remote Terminal Unit",
"RVP" : "Reid Vapor Pressure",
"SAR" : "Search and Rescue",
"SCADA" : "Supervisory Control and Data Acquisition System",
"SCE" : "Southern California Edison ",
"SDCWA" : "San Diego County Water Authority",
"SDG&E" : "San Diego Gas and Electric ",
"SEF" : "State Essential Function ",
"SEMS" : "Standardized Emergency Management System",
"SEOC" : "State Emergency Operations Center",
"SERT" : "State Emergency Response Team",
"SitRep" : "Situation Report",
"SME" : "Subject Matter Expert",
"SNF" : "Skilled Nursing Facility",
"SOC" : "State Operations Center",
"SoCalGas" : "Southern California Gas",
"SOP" : "Standard Operating Procedure",
"SPB" : "State Personnel Board ",
"SPR" : "Stakeholder Preparedness Review",
"T&D" : "Transmission and Distribution",
"TBD" : "To Be Determined",
"THIRA" : "Threat and Hazard Identification and Risk Assessment ",
"TTX" : "Tabletop Exercise",
"UASI" : "Urban Areas Security Initiatives",
"UCSD" : "University of California San Diego",
"USDOT" : "United State Department of Transportation",
"USGS" : "United States Geological Survey ",
"VoIP" : "Voiceover Internet Protocol",
"WAEC" : "Water Agency Emergency Collaborative",
"WUI" : "Wildland Urban Interface "

};

//FUNCTIONS CALLED WITHIN THE BUTTON CLICK


function create_definitions_table (all_acronyms, common_definitions) {
    // Accept either the full return_array ([outputString, combined_list])
    // or a plain newline-separated string containing acronyms.
    var acronymsText = '';

    if (!all_acronyms) return '';

    if (Array.isArray(all_acronyms)) {
        // return_array: [outputString, combined_list]
        acronymsText = all_acronyms[0] || '';
    } else if (typeof all_acronyms === 'string') {
        acronymsText = all_acronyms;
    } else {
        acronymsText = String(all_acronyms);
    }

    // extract contiguous uppercase tokens that look like acronyms
    var matches = acronymsText.match(/([A-Z0-9\/&-]{2,})/g) || [];
    // unique and sorted
    var uniq = {};
    for (var i = 0; i < matches.length; i++) if (matches[i]) uniq[matches[i]] = true;
    var uniqueAcronyms = Object.keys(uniq).sort();

    var outLines = [];
    for (var a = 0; a < uniqueAcronyms.length; a++) {
        var ac = uniqueAcronyms[a];
        var def = '';
        if (common_definitions && common_definitions.hasOwnProperty(ac)) {
            var entry = common_definitions[ac];
            def = Array.isArray(entry) ? entry.join('; ') : String(entry);
        }
        outLines.push(ac + '\t' + def);
    }

    var tsv = outLines.join('\n');

    // populate hidden suggestions textarea for the page UI
    try {
        var ta = document.getElementById('suggestions');
        if (ta) ta.value = tsv;
    } catch (e) { }

    return tsv;
}
    



function already_in_list(word, list) {
    //Returns True if the word is already in the list, false otherwise
    split_list = list.split("\n");
    var list_length = split_list.length;
    for (item = 0; item < list_length; item++) {
        if (split_list[item] == word) {
            return (true);
        }
    }
    return (false);
}


function remove_paren(acronym) {
    //removes the parens around a world
    var string_length = acronym.length;
    var last_letter = acronym.charAt(string_length - 1);
    var first_letter = acronym.charAt(0);

    if (first_letter == "(") {
        var no_first_paren = acronym.slice(1, string_length);
    }
    else {
        var no_first_paren = acronym;
    }
    var paren_length = no_first_paren.length;

    if (last_letter == ")" || last_letter == '(' || last_letter == '/') {
        var no_last_paren = no_first_paren.slice(0, paren_length - 1);
        var new_length = no_last_paren.length;
        var new_last_letter = no_last_paren.charAt(new_length - 1);
        if (new_last_letter == ')') {
            no_last_paren = no_last_paren.slice(0, new_length - 1);
        }
    }
    else {
        var no_last_paren = no_first_paren;
    }
    return (no_last_paren);
}

function remove_bad_last_char(word) {


    // Check if the last character is a letter
    var isLastCharacterLetter = /[a-zA-Z]$/.test(word.charAt(word.length - 1));

    // Check if the last character is a number
    var isLastCharacterNumber = /\d$/.test(word.charAt(word.length - 1));

    if ((isLastCharacterLetter == false) && (isLastCharacterNumber == false)) {
        var no_end = word.slice(0, word.length - 1);
        return no_end;

    }
    else {
        return(word);
    }
}

function remove_s(word_with_possibly_an_s) {
    //removes a lowercase s from the end of a given word (it is always given all caps words or a word from the whitelist)
    //this function explicitly allows SoCalGas to leave unscathed
    var string_length = word_with_possibly_an_s.length;
    var last_letter = word_with_possibly_an_s.charAt(string_length - 1);

    if ((last_letter == "s") && (word_with_possibly_an_s !== "SoCalGas")) {
        var no_s_word = word_with_possibly_an_s.slice(0, string_length - 1);
        return (no_s_word);
    }
    else {
        return (word_with_possibly_an_s);
        }
}


function pluralize_and_add_parens (acronym, which_type) {
    //creates every possible version of an acronym in the text: in parens, plural, and plural in parens
    var acronym_length = acronym.length;
    var last_letter = acronym.charAt(acronym_length - 1);
    var plural_acronym = "";

    if (last_letter == "s") {
        plural_acronym = acronym;
    }
    else {
        plural_acronym = acronym + "s";
    }
    var paren_acronym = "(" + acronym + ")";
    var plural_paren_acronym = "(" + plural_acronym + ")";

    if (which_type == "paren") {

        return (paren_acronym);
    }

    if (which_type == "plural") {

        return (plural_acronym);
    }

    if (which_type == "both") {

        return (plural_paren_acronym);
    }
    else {

        return("bad input")
    }
}


function already_in_appendix(document_word, appendix_words) {
    //returns true if document_word is already in appendix_words
    //I believe this funciton accepts appendix_words only as a list, whereas
    //already_in_list (ironically) only accepts words in a string, but that might not be the case
    //Whatever it's doing, it is not interchangeable with already_in_list
    number_in_appendix = appendix_words.length;

    for (acronym = 0; acronym < number_in_appendix; acronym++) {

        if (appendix_words[acronym] == document_word) {
            return (true);
        }
    }
    return (false);
}


function is_upper_case(document_word) {
    //returns true if a word is all uppercase or uppercase with an s on the end
    //returns false otherwise
    //because it does this by comparing to an all-uppercase version of the input string, it assumes
    //numbers and symbols are uppercase -- they are stripped away in the remove punctuation function
    var upper_word = document_word.toUpperCase();
    var string_length = document_word.length;
    var last_letter = document_word.charAt(string_length - 1);

    if (last_letter == "s") {
        var no_s_word = document_word.slice(0, length - 1);
        var no_s_upper = upper_word.slice(0, length - 1);

        if (no_s_word == no_s_upper) {
            return (true);
        }
        else {
            return (false);
        }
    }

    if (upper_word == document_word) {

        return (true);
    }
    else {
        return (false);
    }
}


function is_this_an_acceptable_word(word) {
    word = word.replace(/[^0-9a-zA-Z&gi]/, '');
}

function remove_punctuation(text_with_punctuation) {
    //removes symbols, punctuation, and numbers from input string
    //it will keep / and &
    //IMPORTANT: if your acronym has a symbol that isn't / or &, it will be stripped here
    var punctuation_free_string = "";
    var remove_everything = text_with_punctuation.split(".").join('');
    var remove_everything = remove_everything.split(",").join('');
    var remove_everything = remove_everything.split(";").join('');
    var remove_everything = remove_everything.split(":").join('');
    var remove_everything = remove_everything.split("?").join('');
    var remove_everything = remove_everything.split("!").join('');
    var remove_everything = remove_everything.split("%").join('');
    var remove_everything = remove_everything.split("*").join('');
    var remove_everything = remove_everything.split("$").join('');
    var remove_everything = remove_everything.split("#").join('');
    var remove_everything = remove_everything.split("1").join('');
    var remove_everything = remove_everything.split("2").join('');
    var remove_everything = remove_everything.split("3").join('');
    var remove_everything = remove_everything.split("4").join('');
    var remove_everything = remove_everything.split("5").join('');
    var remove_everything = remove_everything.split("6").join('');
    var remove_everything = remove_everything.split("7").join('');
    var remove_everything = remove_everything.split("8").join('');
    var remove_everything = remove_everything.split("9").join('');
    var remove_everything = remove_everything.split("0").join('');
    var remove_everything = remove_everything.split("•").join('');
    var remove_everything = remove_everything.split("[").join('');
    var remove_everything = remove_everything.split("_").join('');
    var remove_everything = remove_everything.split("'").join('');
    var remove_everything = remove_everything.split("]").join('');
    var remove_everything = remove_everything.split("-").join('');
    var remove_everything = remove_everything.split("’").join('');
    var remove_everything = remove_everything.split("”").join('');
    var remove_everything = remove_everything.split("“").join('');
    var remove_everything = remove_everything.split("\"").join('');
    //I believe these long underscore removals are no longer necessary,
    //if someone wanted to clean this code up at some point
    var remove_everything = remove_everything.split("–").join('');
    var remove_everything = remove_everything.split("__________").join('');
    var remove_everything = remove_everything.split("______").join('');
    var remove_everything = remove_everything.split("_____________________________________").join('');
    var remove_everything = remove_everything.split("<").join('');
    var remove_everything = remove_everything.split(">").join('');
    var remove_everything = remove_everything.split("___").join('');
    var remove_everything = remove_everything.split("-1").join('');
    var remove_everything = remove_everything.split("__________________").join('');
    var remove_everything = remove_everything.split("…").join('');
    punctuation_free_string += remove_everything;
    return (punctuation_free_string);
}


function standard_whitelist() {
//These are words that are NOT all caps and yet needs to still be gathered such as SLCo and SoCalGas

    var one_word_whitelist = [];

    one_word_whitelist += "SLCo" + "\n";
    one_word_whitelist += "SLCoHD" + "\n";
    one_word_whitelist += "SoCalGas" + "\n";
    one_word_whitelist += "ArcGIS" + "\n";
    one_word_whitelist += "DDoS" + "\n";
    one_word_whitelist += "DoS" + "\n";
    one_word_whitelist += "IoC" + "\n";
    one_word_whitelist += "PoC" + "\n";
    one_word_whitelist += "CoS" + "\n";
    one_word_whitelist += "WebEOC" + "\n";
    one_word_whitelist += "SitRep" + "\n";
    one_word_whitelist += "ExPlan" + "\n";
    return(one_word_whitelist);
}
//Some acronyms like Cal OES are actually two words but one acronym, which requires complicated programming
//to capture, but is captured in this whitelist (when I figure out how to do it)
function complex_whitelist() {




}

function standard_blacklist() {
//the standard blacklist is always in effect and catches things like very long words
//that might appear in all caps as a document heading or in the TOC, as well as non-acronym
//all caps words like VII (Roman Numerals).
    var blacklist = [];
    blacklist += "(XX)-" + "\n";
    blacklist += "22-" + "\n";
    blacklist += "ABBREVIATION" + "\n";
    blacklist += "ACCESSIBLE" + "\n";
    blacklist += "ACTIVITIES" + "\n";
    blacklist += "ACTIVITY" + "\n";
    blacklist += "ADDED" + "\n";
    blacklist += "ADDRESS" + "\n";
    blacklist += "ADMINISTRATIVE" + "\n";
    blacklist += "ANALYSIS" + "\n";
    blacklist += "ASSESS" + "\n";
    blacklist += "ASSIGNED" + "\n";
    blacklist += "BUILDINGS" + "\n";
    blacklist += "CHANGED" + "\n";
    blacklist += "CHECKLIST" + "\n";
    blacklist += "CLASSROOM" + "\n";
    blacklist += "COACHING" + "\n";
    blacklist += "COMMUNICATION" + "\n";
    blacklist += "COMMUNICATIONS" + "\n";
    blacklist += "COMPONENTS" + "\n";
    blacklist += "COMPOSITION" + "\n";
    blacklist += "CONDUCTION" + "\n";
    blacklist += "CONSIDER" + "\n";
    blacklist += "CONTENTS" + "\n";
    blacklist += "COVERED" + "\n";
    blacklist += "CRITERIA" + "\n";
    blacklist += "CUMULATIVE" + "\n";
    blacklist += "CURRENT" + "\n";
    blacklist += "DAMAGE" + "\n";
    blacklist += "DEMONSTRATION" + "\n";
    blacklist += "DETAILS" + "\n";
    blacklist += "DETERMINATION" + "\n";
    blacklist += "DEVELOPMENT" + "\n";
    blacklist += "DISTRIBUTION" + "\n";
    blacklist += "DISTURBING" + "\n";
    blacklist += "DOCUMENT" + "\n";
    blacklist += "DR46" + "\n";
    blacklist += "DVI" + "\n";
    blacklist += "ENDORSEMENT" + "\n";
    blacklist += "EQUIPMENT" + "\n";
    blacklist += "ESTIMATED" + "\n";
    blacklist += "EVALUATION" + "\n";
    blacklist += "EXERCISE" + "\n";
    blacklist += "DRILL" + "\n";
    blacklist += "EXPERIENTIAL" + "\n";
    blacklist += "FACILITATOR" + "\n";
    blacklist += "FACILITIES" + "\n";
    blacklist += "FORMAT" + "\n";
    blacklist += "FURTHER" + "\n";
    blacklist += "GROUND" + "\n";
    blacklist += "II" + "\n";
    blacklist += "INSERT" + "\n";
    blacklist += "INSTRUCTIONS" + "\n";
    blacklist += "INSTRUCTOR" + "\n";
    blacklist += "INSTRUCTORS" + "\n";
    blacklist += "INSURANCE" + "\n";
    blacklist += "INTERNAL" + "\n";
    blacklist += "INTSTRUCTOR" + "\n";
    blacklist += "LEARNING" + "\n";
    blacklist += "MAILING" + "\n";
    blacklist += "MAINTENANCE" + "\n";
    blacklist += "MANAGEMENT" + "\n";
    blacklist += "MANUAL" + "\n";
    blacklist += "MATERIALS" + "\n";
    blacklist += "MEETING" + "\n";
    blacklist += "MINIMUM" + "\n";
    blacklist += "MINUTE" + "\n";
    blacklist += "MINUTES" + "\n";
    blacklist += "MODIFIED" + "\n";
    blacklist += "MODULE" + "\n";
    blacklist += "NUMBER" + "\n";
    blacklist += "OBJECTIVES" + "\n";
    blacklist += "OCCUPANT" + "\n";
    blacklist += "OFFICIAL" + "\n";
    blacklist += "PARTICIPANT" + "\n";
    blacklist += "PARTICIPANTS" + "\n";
    blacklist += "PERFORMANCE" + "\n";
    blacklist += "POSTTRAING" + "\n";
    blacklist += "PREFERENCE" + "\n";
    blacklist += "PREPARATION" + "\n";
    blacklist += "PREPARING" + "\n";
    blacklist += "PROCESS" + "\n";
    blacklist += "PURPOSE" + "\n";
    blacklist += "QUESTION" + "\n";
    blacklist += "RECOVERY" + "\n";
    blacklist += "REMEDIAL" + "\n";
    blacklist += "REPAIR" + "\n";
    blacklist += "REQUIRED" + "\n";
    blacklist += "SATISFACTORY" + "\n";
    blacklist += "SCENARIO" + "\n";
    blacklist += "SCHEDULE" + "\n";
    blacklist += "SECTION" + "\n";
    blacklist += "SETUP" + "\n";
    blacklist += "SHOULD" + "\n";
    blacklist += "SIMULATION" + "\n";
    blacklist += "SITUATION" + "\n";
    blacklist += "SLIDE" + "\n";
    blacklist += "SLOT" + "\n";
    blacklist += "STRUCTURES" + "\n";
    blacklist += "SUPPLIES" + "\n";
    blacklist += "SUPPORT" + "\n";
    blacklist += "TASKDETAILS" + "\n";
    blacklist += "TRAINING" + "\n";
    blacklist += "TRANSPORTATION" + "\n";
    blacklist += "UNSATISFACTORY" + "\n";
    blacklist += "VII" + "\n";
    blacklist += "VI" + "\n";
    blacklist += "IV" + "\n";
    blacklist += "II" + "\n";
    blacklist += "III" + "\n";
    blacklist += "XI" + "\n";
    blacklist += "APPENDIX" + "\n";
    blacklist += "ACRONYM" + "\n";
    return (blacklist);
}

function make_FQS_blacklist() {
    //this function adds all my pre-defined blacklisted terms to the blacklist and will
    //only be used if you are QA'ing FQS documents with the same blacklist needs
    var blacklist = [];
    blacklist += "(XX)-" + "\n";
    blacklist += "22-" + "\n";
    blacklist += "ABBREVIATION" + "\n";
    blacklist += "ACCESSIBLE" + "\n";
    blacklist += "ACTION" + "\n";
    blacklist += "ACTIVITIES" + "\n";
    blacklist += "ACTIVITIES" + "\n";
    blacklist += "ACTIVITY" + "\n";
    blacklist += "ACTS" + "\n";
    blacklist += "ADDED" + "\n";
    blacklist += "ADDRESS" + "\n";
    blacklist += "ADMINISTRATIVE" + "\n";
    blacklist += "AFTER" + "\n";
    blacklist += "ALL" + "\n";
    blacklist += "ANALYSIS" + "\n";
    blacklist += "AND" + "\n";
    blacklist += "ASSESS" + "\n";
    blacklist += "ASSIGNED" + "\n";
    blacklist += "BRIEF" + "\n";
    blacklist += "BUILDINGS" + "\n";
    blacklist += "CASE" + "\n";
    blacklist += "CHANGED" + "\n";
    blacklist += "CHECKLIST" + "\n";
    blacklist += "CLASS" + "\n";
    blacklist += "CLASSROOM" + "\n";
    blacklist += "COACHING" + "\n";
    blacklist += "COMMUNICATION" + "\n";
    blacklist += "COMMUNICATIONS" + "\n";
    blacklist += "COMPLETE" + "\n";
    blacklist += "COMPONENTS" + "\n";
    blacklist += "COMPOSITION" + "\n";
    blacklist += "CONDUCTION" + "\n";
    blacklist += "CONSIDER" + "\n";
    blacklist += "CONTENTS" + "\n";
    blacklist += "COURSE" + "\n";
    blacklist += "COVERED" + "\n";
    blacklist += "CRITERIA" + "\n";
    blacklist += "CRITERIACONSIDER" + "\n";
    blacklist += "CRITERIASATISFACTORY" + "\n";
    blacklist += "CRITERIASATISFACTORY" + "\n";
    blacklist += "CUMULATIVE" + "\n";
    blacklist += "CURRENT" + "\n";
    blacklist += "DAMAGE" + "\n";
    blacklist += "DATA" + "\n";
    blacklist += "DAY" + "\n";
    blacklist += "DEMONSTRATION" + "\n";
    blacklist += "DETAILS" + "\n";
    blacklist += "DETERMINATION" + "\n";
    blacklist += "DEVELOPMENT" + "\n";
    blacklist += "DISTRIBUTION" + "\n";
    blacklist += "DISTURBING" + "\n";
    blacklist += "DOCUMENT" + "\n";
    blacklist += "DR46" + "\n";
    blacklist += "DVI" + "\n";
    blacklist += "ENDORSEMENT" + "\n";
    blacklist += "ENDORSEMENTNEEDS" + "\n";
    blacklist += "EQUIPMENT" + "\n";
    blacklist += "EST" + "\n";
    blacklist += "ESTIMATED" + "\n";
    blacklist += "EVALUATION" + "\n";
    blacklist += "EXERCISE" + "\n";
    blacklist += "EXPERIENTIAL" + "\n";
    blacklist += "FACILITATOR" + "\n";
    blacklist += "FACILITIES" + "\n";
    blacklist += "FIGHT" + "\n";
    blacklist += "FOR" + "\n";
    blacklist += "FORMAT" + "\n";
    blacklist += "FURTHER" + "\n";
    blacklist += "GIS" + "\n";
    blacklist += "GROUND" + "\n";
    blacklist += "GROUP" + "\n";
    blacklist += "GROUPC&E" + "\n";
    blacklist += "GROUPSLOT" + "\n";
    blacklist += "HDMI" + "\n";
    blacklist += "HIDE" + "\n";
    blacklist += "HOUR" + "\n";
    blacklist += "HOURS" + "\n";
    blacklist += "II" + "\n";
    blacklist += "INSERT" + "\n";
    blacklist += "INSTRUCTIONS" + "\n";
    blacklist += "INSTRUCTOR" + "\n";
    blacklist += "INSTRUCTORS" + "\n";
    blacklist += "INSURANCE" + "\n";
    blacklist += "INTERNAL" + "\n";
    blacklist += "INTSTRUCTOR" + "\n";
    blacklist += "LEARNING" + "\n";
    blacklist += "LINK" + "\n";
    blacklist += "LONGTERM" + "\n";
    blacklist += "MAILING" + "\n";
    blacklist += "MAINTENANCE" + "\n";
    blacklist += "MANAGEMENT" + "\n";
    blacklist += "MANUAL" + "\n";
    blacklist += "MATERIALS" + "\n";
    blacklist += "MEETING" + "\n";
    blacklist += "MIN" + "\n";
    blacklist += "MINIMUM" + "\n";
    blacklist += "MINSLOT" + "\n";
    blacklist += "MINUTE" + "\n";
    blacklist += "MINUTES" + "\n";
    blacklist += "MODIFIED" + "\n";
    blacklist += "MODULE" + "\n";
    blacklist += "MORE" + "\n";
    blacklist += "MOST" + "\n";
    blacklist += "NAME" + "\n";
    blacklist += "NAMEPARTICIPANT" + "\n";
    blacklist += "NAMETIME" + "\n";
    blacklist += "NEEDS" + "\n";
    blacklist += "NOT" + "\n";
    blacklist += "NOTES" + "\n";
    blacklist += "NUMBER" + "\n";
    blacklist += "OBJECTIVES" + "\n";
    blacklist += "OCCUPANT" + "\n";
    blacklist += "OF" + "\n";
    blacklist += "OFFICIAL" + "\n";
    blacklist += "OFTEN" + "\n";
    blacklist += "ONLY" + "\n";
    blacklist += "PARTICIPANT" + "\n";
    blacklist += "PARTICIPANTACTIONESTIMATED" + "\n";
    blacklist += "PARTICIPANTS" + "\n";
    blacklist += "PERFORMANCE" + "\n";
    blacklist += "PERFORMANCEUNSATISFACTORY" + "\n";
    blacklist += "PHASE" + "\n";
    blacklist += "PHONE" + "\n";
    blacklist += "PIVOT" + "\n";
    blacklist += "PLAN" + "\n";
    blacklist += "POSTTRAING" + "\n";
    blacklist += "PREFERENCE" + "\n";
    blacklist += "PREPARATION" + "\n";
    blacklist += "PREPARING" + "\n";
    blacklist += "PROCESS" + "\n";
    blacklist += "PURPOSE" + "\n";
    blacklist += "QUESTION" + "\n";
    blacklist += "RECOVERY" + "\n";
    blacklist += "REMEDIAL" + "\n";
    blacklist += "REPAIR" + "\n";
    blacklist += "REQUIRED" + "\n";
    blacklist += "REQUIREDUNSATISFACTORY" + "\n";
    blacklist += "REVIEW" + "\n";
    blacklist += "RUN" + "\n";
    blacklist += "SATISFACTORY" + "\n";
    blacklist += "SCENARIO" + "\n";
    blacklist += "SCHEDULE" + "\n";
    blacklist += "SCOPE" + "\n";
    blacklist += "SECTION" + "\n";
    blacklist += "SETUP" + "\n";
    blacklist += "SHOULD" + "\n";
    blacklist += "SIMULATION" + "\n";
    blacklist += "SITUATION" + "\n";
    blacklist += "SLIDE" + "\n";
    blacklist += "SLOT" + "\n";
    blacklist += "STRUCTURES" + "\n";
    blacklist += "SUPPLIES" + "\n";
    blacklist += "SUPPORT" + "\n";
    blacklist += "TABLE" + "\n";
    blacklist += "TASK" + "\n";
    blacklist += "TASKDETAILS" + "\n";
    blacklist += "TASKS" + "\n";
    blacklist += "TIME" + "\n";
    blacklist += "TITLE" + "\n";
    blacklist += "TO" + "\n";
    blacklist += "TRAINING" + "\n";
    blacklist += "TRANSPORTATION" + "\n";
    blacklist += "UNSATISFACTORY" + "\n";
    blacklist += "UPDATE" + "\n";
    blacklist += "UPDATED" + "\n";
    blacklist += "USE" + "\n";
    blacklist += "VGA" + "\n";
    blacklist += "WORK" + "\n";
    blacklist += "XX" + "\n";
    blacklist += "XX)-" + "\n";
    blacklist += "XXX" + "\n";
    blacklist += "XXXX" + "\n";
    return (blacklist);
}


