"use strict";
am4core.useTheme(am4themes_animated);
var chart = am4core.create("chartdiv", am4maps.MapChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
var orthoProj = new am4maps.projections.Orthographic();
var millerProj = new am4maps.projections.Miller();
chart.geodata = am4geodata_worldLow;
chart.projection = orthoProj;
chart.deltaLatitude = -30;
chart.panBehavior = "rotateLongLat";
chart.marginTop = 20;
chart.marginBottom = 20;
// Add zoom control
chart.zoomControl = new am4maps.ZoomControl();
chart.adapter.add("deltaLatitude", function (delatLatitude) {
    return am4core.math.fitToRange(delatLatitude, -90, 90);
});
var grid = chart.series.push(new am4maps.GraticuleSeries());
grid.toBack();
grid.fitExtent = false;
var title = chart.chartContainer.createChild(am4core.Label);
// title.text = "Interactive Map";
title.fontsize = 5;
title.paddingTop = 30;
title.align = "center";
title.zIndex = 100;
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
polygonSeries.heatRules.push({
    property: "fill",
    target: polygonSeries.mapPolygons.template,
    min: am4core.color("#ffffff"),
    max: am4core.color("#43a11f")
});
polygonSeries.useGeodata = true;
var tipMode = 3;
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.setStateOnChildren = true;
// polygonTemplate.adapter.add("tooltipText", function (text, target) {
//     switch (tipMode) {
//         case 0:
//             return "{name}: {value.value.formatNumber('000,000')}";
//         case 1:
//             return "{name}: {value.value.formatNumber('0.0')}";
//         case 2:
//             return "{name}: {value.value.formatNumber('0.0')}%";
//         case 3:
//             return "{name}";
//         case 4:
//             return "{name}: {value.value.formatNumber('0.0')}/1000 population";
//         case 5:
//             return "";
//     }
// });
//polygonTemplate.togglable = false;
// add heat legend
var heatLegend = chart.chartContainer.createChild(am4maps.HeatLegend);
heatLegend.valign = "bottom";
heatLegend.align = "left";
heatLegend.width = am4core.percent(100);
heatLegend.series = polygonSeries;
heatLegend.orientation = "horizontal";
heatLegend.padding(20, 20, 20, 20);
heatLegend.valueAxis.renderer.labels.template.fontSize = 5;
heatLegend.valueAxis.renderer.minGridDistance = 40;
polygonSeries.mapPolygons.template.events.on("over", (event) => {
    handleHover(event.target);
});
polygonSeries.mapPolygons.template.events.on("hit", (event) => {
    handleHover(event.target);
});
function handleHover(mapPolygon) {
    if (!isNaN(mapPolygon.dataItem.value)) {
        heatLegend.valueAxis.showTooltipAt(mapPolygon.dataItem.value);
    }
    else {
        heatLegend.valueAxis.hideTooltip();
    }
}
polygonSeries.mapPolygons.template.strokeOpacity = 0.4;
polygonSeries.mapPolygons.template.events.on("out", (event) => {
    heatLegend.valueAxis.hideTooltip();
});
heatLegend.disabled = true;
chart.zoomControl = new am4maps.ZoomControl();
chart.zoomControl.valign = "top";
let nullState = polygonSeries.mapPolygons.template.states.create("nullified");
nullState.properties.fill = am4core.color("#8c8c8c");
nullState.properties.hoverable = false;
nullState.properties.clickable = false;
let correctState = polygonSeries.mapPolygons.template.states.create("correct");
correctState.properties.fill = am4core.color("#60e645");
correctState.properties.hoverable = true;
correctState.properties.clickable = false;
let wrongState = polygonSeries.mapPolygons.template.states.create("wrong");
wrongState.properties.fill = am4core.color("#e01616");
wrongState.properties.hoverable = true;
wrongState.properties.clickable = false;
wrongState.properties.togglable = true;
polygonSeries.mapPolygons.template.defaultState.properties.hoverable = true;
polygonSeries.mapPolygons.template.defaultState.properties.clickable = false;
let worldData = [
    {
        id: "AF",
        name: "Afghanistan",
        background: "Ahmad Shah DURRANI unified the Pashtun tribes and founded Afghanistan in 1747. The country served as a buffer between the British and Russian Empires until it won independence from notional British control in 1919. A brief experiment in increased democracy ended in a 1973 coup and a 1978 communist countercoup. The Soviet Union invaded in 1979 to support the tottering Afghan communist regime, touching off a long and destructive war. The USSR withdrew in 1989 under relentless pressure by internationally supported anti-communist mujahidin rebels. A series of subsequent civil wars saw Kabul finally fall in 1996 to the Taliban, a hardline Pakistani-sponsored movement that emerged in 1994 to end the country's civil war and anarchy. Following the 11 September 2001 terrorist attacks, a US, Allied, and anti-Taliban Northern Alliance military action toppled the Taliban for sheltering Usama BIN LADIN.A UN-sponsored Bonn Conference in 2001 established a process for political reconstruction that included the adoption of a new constitution, a presidential election in 2004, and National Assembly elections in 2005. In December 2004, Hamid KARZAI became the first democratically elected president of Afghanistan, and the National Assembly was inaugurated the following December. KARZAI was reelected in August 2009 for a second term. The 2014 presidential election was the country's first to include a runoff, which featured the top two vote-getters from the first round, Abdullah ABDULLAH and Ashraf GHANI. Throughout the summer of 2014, their campaigns disputed the results and traded accusations of fraud, leading to a US-led diplomatic intervention that included a full vote audit as well as political negotiations between the two camps. In September 2014, GHANI and ABDULLAH agreed to form the Government of National Unity, with GHANI inaugurated as president and ABDULLAH elevated to the newly-created position of chief executive officer. The day after the inauguration, the GHANI administration signed the US-Afghan Bilateral Security Agreement and NATO Status of Forces Agreement, which provide the legal basis for the post-2014 international military presence in Afghanistan. After two postponements, the next presidential election was held in September 2019.The Taliban remains a serious challenge for the Afghan Government in almost every province. The Taliban still considers itself the rightful government of Afghanistan, and it remains a capable and confident insurgent force fighting for the withdrawal of foreign military forces from Afghanistan, establishment of sharia law, and rewriting of the Afghan constitution. In 2019, negotiations between the US and the Taliban in Doha entered their highest level yet, building on momentum that began in late 2018. Underlying the negotiations is the unsettled state of Afghan politics, and prospects for a sustainable political settlement remain unclear.",
        region: "Asia",
        capital: "Kabul",
        "birth rate": 36.7,
        "death rate": 12.7,
        "population growth": 2.38,
        "labor force": 8478000,
        population: 36643815,
        "median age": 19.5,
        "GDP(PPP)": 69450000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AF-flag.gif"
    },
    {
        id: "AL",
        name: "Albania",
        background: "Albania declared its independence from the Ottoman Empire in 1912, but was conquered by Italy in 1939 and occupied by Germany in 1943. Communist partisans took over the country in 1944. Albania allied itself first with the USSR (until 1960), and then with China (to 1978). In the early 1990s, Albania ended 46 years ofisolated communist rule and established a multiparty democracy. The transition has proven challenging as successive governments have tried to deal with high unemployment, widespread corruption, dilapidated infrastructure, powerful organized crime networks, and combative political opponents.Albania has made progress in its democratic development since it firstheld multiparty elections in 1991, but deficiencies remain. Most of Albania's post-communist elections were marred by claims of electoral fraud; however, international observers judged elections to be largely free and fair since the restoration of political stability following the collapse of pyramid schemes in 1997. Albania joined NATO in April 2009 and in June 2014 became an EUcandidate. Albania in April 2017 received a European Commission recommendation to open EU accession negotiations following the passage of historic EU-mandated justice reforms in 2016. Although Albania's economy continues to grow, it has slowed, and the country is still one of the poorest in Europe. A large informal economy and a weak energy and transportation infrastructure remain obstacles.",
        region: "Europe",
        capital: "Tirana",
        "birth rate": 13,
        "death rate": 7.1,
        "population growth": 0.28,
        "labor force": 1198000,
        population: 3074579,
        "median age": 34.3,
        "GDP(PPP)": 36010000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AL-flag.gif"
    },
    {
        id: "DZ",
        name: "Algeria",
        background: "After more than a century of rule by France, Algerians fought through much of the 1950s to achieve independence in 1962. Algeria's primary political party, the National Liberation Front (FLN), was established in 1954 as part of the struggle for independence and has since largely dominated politics. The Government of Algeria in 1988 instituted a multi-party system in response to public unrest, but the surprising first round success of the Islamic Salvation Front (FIS) in the December 1991 legislative elections led the Algerian army to intervene and postpone the second round of elections to prevent what the secular elite feared would be an extremist-led government from assuming power. The army began a crackdown on the FIS that spurred FIS supporters to begin attacking government targets. Fighting escalated into an insurgency, which saw intense violence from 1992-98, resulting in over 100,000 deaths - many attributed to indiscriminate massacres of villagers by extremists. The government gained the upper hand by the late-1990s, and FIS's armed wing, the Islamic Salvation Army, disbanded in January 2000.Abdelaziz BOUTEFLIKA, with the backing of the military, won the presidency in 1999 in an election that was boycotted by several candidates protesting alleged fraud, and won subsequent elections in 2004, 2009, and 2014. The government in 2011 introduced some political reforms in response to the Arab Spring, including lifting the 19-year-old state of emergency restrictions and increasing women's quotas for elected assemblies, while also increasing subsidies to the populace. Since 2014, Algerias reliance on hydrocarbon revenues to fund the government and finance the large subsidies for the population has fallen under stress because of declining oil prices. Protests broke out across the country in late February 2019 against President BOUTEFLIKAs decision to seek a fifth term. BOUTEFLIKA resigned on 2 April 2019, and the speaker of the upper house of parliament, Abdelkader BENSALAH, became interim head of state on 9 April. BENSALAH remained in office beyond the 90-day constitutional limit until Algerians elected former Prime Minister Abdelmadjid TEBBOUNE as the country's new president in December 2019.",
        region: "Africa",
        capital: "Algiers",
        "birth rate": 20,
        "death rate": 4.4,
        "population growth": 1.52,
        "labor force": 11820000,
        population: 42972878,
        "median age": 28.9,
        "GDP(PPP)": 630000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AG-flag.gif"
    },
    {
        id: "AS",
        name: "American Samoa",
        background: "Settled as early as 1000 B.C., Samoa was not reached by European explorers until the 18th century. International rivalries in the latter half of the 19th century were settled by an 1899 treaty in which Germany and the US divided the Samoan archipelago. The US formally occupied its portion - a smaller group of eastern islands with the excellent harbor of Pago Pago - the following year.",
        region: "Oceania",
        capital: "PagoPago",
        "birth rate": 17.8,
        "death rate": 5.9,
        "population growth": -1.4,
        "labor force": 17850,
        population: 49437,
        "median age": 27.2,
        "GDP(PPP)": 658000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AQ-flag.gif"
    },
    {
        id: "AD",
        name: "Andorra",
        background: "The landlocked Principality of Andorra is one of the smallest states in Europe, nestled high in the Pyrenees between the French and Spanish borders. For 715 years, from 1278 to 1993, Andorrans lived under a unique coprincipality, ruled by French and Spanish leaders (from 1607 onward, the French chief of state and the Bishop of Urgell). In 1993, this feudal system was modified with the introduction of a modern constitution; the co-princes remained as titular heads of state, but the government transformed into a parliamentary democracy.Andorra has become a popular tourist destination visited by approximately 8 million people each year drawn by the winter sports, summer climate, and duty-free shopping. Andorra has also become a wealthy international commercial center because of its mature banking sector and low taxes. As part of its effort to modernize its economy, Andorra has opened to foreign investment, and engaged in other reforms, such as advancing tax initiatives aimed at supporting a broader infrastructure. Although not a member of the EU, Andorra enjoys a special relationship with the bloc that is governed by various customs and cooperation agreements and uses the euro as its national currency.",
        region: "Europe",
        capital: "Andorrala Vella",
        "birth rate": 7,
        "death rate": 7.7,
        "population growth": -0.06,
        "labor force": 39750,
        population: 77000,
        "median age": 46.2,
        "GDP(PPP)": 3327000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AN-flag.gif"
    },
    {
        id: "AO",
        name: "Angola",
        background: "Angola scores low on human development indexes despite using its large oil reserves to rebuild since the end of a 27-year civil war in 2002. Fighting between the Popular Movement for the Liberation of Angola (MPLA), led by Jose Eduardo DOS SANTOS, and the National Union for the Total Independence of Angola (UNITA), led by Jonas SAVIMBI, followed independence from Portugal in 1975. Peace seemed imminent in 1992 when Angola held national elections, but fighting picked up again in 1993. Up to 1.5 million lives may have been lost - and 4 million people displaced - during the more than a quarter century of fighting. SAVIMBI's death in 2002 ended UNITA's insurgency and cemented the MPLA's hold on power. DOS SANTOS stepped down from the presidency in 2017, having led the country since 1979. He pushed through a new constitution in 2010. Joao LOURENCO was elected president in August 2017 and became president of the MPLA in September 2018.",
        region: "Africa",
        capital: "Luanda",
        "birth rate": 42.7,
        "death rate": 8.5,
        "population growth": 3.43,
        "labor force": 12510000,
        population: 32522339,
        "median age": 15.9,
        "GDP(PPP)": 193600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AO-flag.gif"
    },
    {
        id: "AI",
        name: "Anguilla",
        background: "Colonized by English settlers from Saint Kitts in 1650, Anguilla was administered by Great Britain until the early 19th century, when the island - against the wishes of the inhabitants - was incorporated into a single British dependency along with Saint Kitts and Nevis. Several attempts at separation failed. In 1971, two years after a revolt, Anguilla was finally allowed to secede; this arrangement was formally recognized in 1980, with Anguilla becoming a separate British dependency. On 7 September 2017, the island suffered extensive damage from Hurricane Irma, particularly to communications and residential and business infrastructure.",
        region: "Central America & The Caribbean",
        capital: "The Valley",
        "birth rate": 12.2,
        "death rate": 4.8,
        "population growth": 1.86,
        "labor force": 6049,
        population: 18090,
        "median age": 35.7,
        "GDP(PPP)": 175400000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AV-flag.gif"
    },
    {
        id: "AG",
        name: "Antigua and Barbuda",
        background: "The Siboney were the first people to inhabit the islands of Antigua and Barbuda in 2400 B.C., but Arawak Indians populated the islands when COLUMBUS landed on his second voyage in 1493. Early Spanish and French settlements were succeeded by an English colony in 1667. Slavery, established to run the sugar plantations on Antigua, was abolished in 1834. The islands became an independent state within the British Commonwealth of Nations in 1981. On 6 September 2017, Hurricane Irma passed over the island of Barbuda devastating the island and forcing the evacuation of the population to Antigua. Almost all the structures on Barbuda were destroyed and the vegetation stripped, but Antigua was spared the worst.",
        region: "Central America & The Caribbean",
        capital: "Saint John's",
        "birth rate": 15.4,
        "death rate": 5.8,
        "population growth": 1.18,
        "labor force": 30000,
        population: 98179,
        "median age": 32.7,
        "GDP(PPP)": 2398000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AC-flag.gif"
    },
    {
        id: "AR",
        name: "Argentina",
        background: "In 1816, the United Provinces of the Rio Plata declared their independence from Spain. After Bolivia, Paraguay, and Uruguay went their separate ways, the area that remained became Argentina. The country's population and culture were heavily shaped by immigrants from throughout Europe, with Italy and Spain providing the largest percentage of newcomers from 1860 to 1930. Up until about the mid-20th century, much of Argentina's history was dominated by periods of internal political unrest and conflict between civilian and military factions.After World War II, an era of Peronist populism and direct and indirect military interference in subsequent governments was followed by a military junta that took power in 1976. Democracy returned in 1983 after a failed bid to seize the Falkland Islands (Islas Malvinas) by force, and has persisted despite numerous challenges, the most formidable of which was a severe economic crisis in 2001-02 that led to violent public protests and the successive resignations of several presidents. The years 2003-15 saw Peronist rule by Nestor and Cristina FERNANDEZ de KIRCHNER, whose policies isolated Argentina and caused economic stagnation. With the election of Mauricio MACRI in November 2015, Argentina began a period of reform and international reintegration.",
        region: "South America",
        capital: "Buenos Aires",
        "birth rate": 16,
        "death rate": 7.4,
        "population growth": 0.86,
        "labor force": 18000000,
        population: 45479118,
        "median age": 32.4,
        "GDP(PPP)": 922100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AR-flag.gif"
    },
    {
        id: "AM",
        name: "Armenia",
        background: "Armenia prides itself on being the first nation to formally adopt Christianity (early 4th century). Despite periods of autonomy, over the centuries Armenia came under the sway of various empires including the Roman, Byzantine, Arab, Persian, and Ottoman. During World War I in the western portion of Armenia, the Ottoman Empire instituted a policy of forced resettlement coupled with other harsh practices that resulted in at least 1 million Armenian deaths. The eastern area of Armenia was ceded by the Ottomans to Russia in 1828; this portion declared its independence in 1918, but was conquered by the Soviet Red Army in 1920.Armenia remains involved in the protracted Nagorno-Karabakh conflict with Azerbaijan. Nagorno-Karabakh was a primarily ethnic Armenian region that Moscow recognized in 1923 as an autonomous oblast within Soviet Azerbaijan. In the late Soviet period, a separatist movement developed which sought to end Azerbaijani control over the region. Fighting over Nagorno-Karabakh began in 1988 and escalated after Armenia and Azerbaijan attained independence from the Soviet Union in 1991. By the time a ceasefire took effect in May 1994, separatists, with Armenian support, controlled NagornoKarabakh and seven surrounding Azerbaijani territories. The 1994 ceasefire continues to hold, although violence continues along the line of contact separating the opposing forces, as well as the Armenia-Azerbaijan international border. The final status of Nagorno-Karabakh remains the subject of international mediation by the Organization for Security and Cooperation in Europe (OSCE) Minsk Group, which works to help the sides settle the conflict peacefully. The OSCE Minsk Group is cochaired by the US, France, and Russia.Turkey closed the common border with Armenia in 1993 in support of Azerbaijan in its conflict with Armenia over control of Nagorno-Karabakh and surrounding areas, further hampering Armenian economic growth. In 2009, Armenia and Turkey signed Protocols normalizing relations between the two countries, but neither country ratified the Protocols, and Armenia officially withdrew from the Protocols in March 2018. In 2015, Armenia joined the Eurasian Economic Union alongside Russia, Belarus, Kazakhstan, and Kyrgyzstan. In November 2017, Armenia signed a Comprehensive and Enhanced Partnership Agreement (CEPA) with the EU. In spring 2018, Serzh SARGSIAN of the Republican Party of Armenia (RPA) stepped down and Civil Contract party leader Nikol PASHINYAN became prime minister.",
        region: "Asia",
        capital: "Yerevan",
        "birth rate": 11.9,
        "death rate": 9.5,
        "population growth": -0.3,
        "labor force": 1507000,
        population: 3021324,
        "median age": 36.6,
        "GDP(PPP)": 28340000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AM-flag.gif"
    },
    {
        id: "AW",
        name: "Aruba",
        background: "Discovered and claimed for Spain in 1499, Aruba was acquired by the Dutch in 1636. The island's economy has been dominated by three main industries. A 19th century gold rush was followed by prosperity brought on by the opening in 1924 of an oil refinery. The last decades of the 20th century saw a boom in the tourism industry. Aruba seceded from the Netherlands Antilles in 1986 and became a separate, semi-autonomous member of the Kingdom of the Netherlands. Movement toward full independence was halted at Aruba's request in 1990.",
        region: "Central America & The Caribbean",
        capital: "Oranjestad",
        "birth rate": 12.1,
        "death rate": 8.7,
        "population growth": 1.19,
        "labor force": 51610,
        population: 119428,
        "median age": 39.9,
        "GDP(PPP)": 4158000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AA-flag.gif"
    },
    {
        id: "AU",
        name: "Australia",
        background: "Prehistoric settlers arrived on the continent from Southeast Asia at least 40,000 years before the first Europeans began exploration in the 17th century. No formal territorial claims were made until 1770, when Capt. James COOK took possession of the east coast in the name of Great Britain (all of Australia was claimed as British territory in 1829 with the creation of the colony of Western Australia). Six colonies were created in the late 18th and 19th centuries; they federated and became the Commonwealth of Australia in 1901. The new country took advantage of its natural resources to rapidly develop agricultural and manufacturing industries and to make a major contribution to the Allied effort in World Wars I and II.In recent decades, Australia has become an internationally competitive, advanced market economy due in large part to economic reforms adopted in the 1980s and its location in one of the fastest growing regions of the world economy. Long-term concerns include an aging population, pressure on infrastructure, and environmental issues such as floods, droughts, and bushfires. Australia is the driest inhabited continent on earth, making it particularly vulnerable to the challenges of climate change. Australia is home to 10% of the world's biodiversity, and a great number of its flora and fauna exist nowhere else in the world.",
        region: "Oceania",
        capital: "Canberra",
        "birth rate": 12.4,
        "death rate": 6.9,
        "population growth": 1.4,
        "labor force": 12910000,
        population: 25466459,
        "median age": 37.5,
        "GDP(PPP)": 1248000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AS-flag.gif"
    },
    {
        id: "AT",
        name: "Austria",
        background: "Once the center of power for the large Austro-Hungarian Empire, Austria was reduced to a small republic after its defeat in World War I. Following annexation by Nazi Germany in 1938 and subsequent occupation by the victorious Allies in 1945, Austria's status remained unclear for a decade. A State Treaty signed in 1955 ended the occupation, recognized Austria's independence, and forbade unification with Germany. A constitutional law that same year declared the country's \"perpetual neutrality\" as a condition for Soviet military withdrawal. The Soviet Union's collapse in 1991 and Austria's entry into the EU in 1995 have altered the meaning of this neutrality. A prosperous, democratic country, Austria entered the EU Economic and Monetary Union in 1999.",
        region: "Europe",
        capital: "Vienna",
        "birth rate": 9.5,
        "death rate": 9.8,
        "population growth": 0.35,
        "labor force": 4260000,
        population: 8859449,
        "median age": 44.5,
        "GDP(PPP)": 441000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AU-flag.gif"
    },
    {
        id: "AZ",
        name: "Azerbaijan",
        background: "Azerbaijan - a secular nation with a majority-Turkic and majority-Shia Muslim population - was briefly independent (from 1918 to 1920) following the collapse of the Russian Empire; it was subsequently incorporated into the Soviet Union for seven decades. Azerbaijan remains involved in the protracted Nagorno-Karabakh conflict with Armenia. Nagorno-Karabakh was a primarily ethnic Armenian region that Moscow recognized in 1923 as an autonomous oblast within Soviet Azerbaijan. In the late Soviet period, a separatist movement developed which sought to end Azerbaijani control over the region. Fighting over Nagorno-Karabakh began in 1988 and escalated after Armenia and Azerbaijan attained independence from the Soviet Union in 1991. By the time a ceasefire took effect in May 1994, separatists, with Armenian support, controlled NagornoKarabakh and seven surrounding Azerbaijani territories. The 1994 ceasefire continues to hold, although violence continues along the line of contact separating the opposing forces, as well as the Azerbaijan-Armenia international border. The final status of Nagorno-Karabakh remains the subject of international mediation by the Organization for Security and Cooperation in Europe (OSCE) Minsk Group, which works to help the sides settle the conflict peacefully. The OSCE Minsk Group is cochaired by the United States, France, and Russia. In the 25 years following its independence, Azerbaijan succeeded in significantly reducing the poverty rate and has directed revenues from its oil and gas production to develop the countrys infrastructure. However, corruption remains a problem, and the government has been accused of authoritarianism. The countrys leadership has remained in the Aliyev family since Heydar ALIYEV became president in 1993 and was succeeded by his son, President Ilham ALIYEV in 2003. Following two national referendums in the past several years that eliminated presidential term limits and extended presidential terms from 5 to 7 years, President ALIYEV secured a fourth term as president in April 2018 in an election that international observers noted had serious shortcomings. Reforms are underway to diversify the countrys non-oil economy and additional reforms are needed to address weaknesses in government institutions, particularly in the education and health sectors, and the court system.",
        region: "Asia",
        capital: "Baku",
        "birth rate": 14.5,
        "death rate": 7,
        "population growth": 0.77,
        "labor force": 5118000,
        population: 10205810,
        "median age": 32.6,
        "GDP(PPP)": 172200000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AJ-flag.gif"
    },
    {
        id: "BS",
        name: "The Bahamas",
        background: "Lucayan Indians inhabited the islands when Christopher COLUMBUS first set foot in the New World on San Salvador in 1492. British settlement of the islands began in 1647; the islands became a colony in 1783. Piracy thrived in the 17th and 18th centuries because of The Bahamas close proximity to shipping lanes. Since attaining independence from the UK in 1973, The Bahamas has prospered through tourism, international banking, and investment management, which comprise up to 85% of GDP. Because of its proximity to the US - the nearest Bahamian landmass being only 80 km (50 mi) from Florida - the country is a major transshipment point for illicit trafficking, particularly to the US mainland, as well as Europe. US law enforcement agencies cooperate closely with The Bahamas, and the US Coast Guard assists Bahamian authorities in coastal defense through Operation Bahamas, Turks and Caicos, or OPBAT.",
        region: "Central America & The Caribbean",
        capital: "Nassau",
        "birth rate": 14.8,
        "death rate": 7.4,
        "population growth": 0.75,
        "labor force": 196900,
        population: 337721,
        "median age": 32.8,
        "GDP(PPP)": 12060000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BF-flag.gif"
    },
    {
        id: "BH",
        name: "Bahrain",
        background: "In 1783, the Sunni Al-Khalifa family took power in Bahrain. In order to secure these holdings, it entered into a series of treaties with the UK during the 19th century that made Bahrain a British protectorate. The archipelago attained its independence in 1971. A steady decline in oil production and reserves since 1970 prompted Bahrain to take steps to diversify its economy, in the process developing petroleum processing and refining, aluminum production, and hospitality and retail sectors. It has also endeavored to become a leading regional banking center, especially with respect to Islamic finance. Bahrain's small size, central location among Gulf countries, economic dependence on Saudi Arabia, and proximity to Iran require it to play a delicate balancing act in foreign affairs among its larger neighbors. Its foreign policy activities usually fall in line with Saudi Arabia and the UAE.The Sunni royal family has long struggled to manage relations with its large Shia-majority population. In early 2011, amid Arab uprisings elsewhere in the region, the Bahraini Government confronted similar pro-democracy and reform protests at home with police and military action, including deploying Gulf Cooperation Council security forces to Bahrain. Failed political talks prompted opposition political societies to boycott 2014 legislative and municipal council elections. In 2018, a law preventing members of political societies dissolved by the courts from participating in elections effectively sidelined the majority of opposition figures from taking part in national elections. As a result, most members of parliament are independents. Ongoing dissatisfaction with the political status quo continues to factor into sporadic clashes between demonstrators and security forces.",
        region: "Middle East",
        capital: "Manama",
        "birth rate": 12.7,
        "death rate": 2.8,
        "population growth": 2.08,
        "labor force": 831600,
        population: 1505003,
        "median age": 32.9,
        "GDP(PPP)": 71170000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BA-flag.gif"
    },
    {
        id: "BD",
        name: "Bangladesh",
        background: "The huge delta region formed at the confluence of the Ganges and Brahmaputra River systems - now referred to as Bangladesh - was a loosely incorporated outpost of various empires centered on the Gangetic plain for much of the first millennium A.D. Muslim conversions and settlement in the region began in the 10th century, primarily from Arab and Persian traders and preachers. Europeans established trading posts in the area in the 16th century. Eventually the area known as Bengal, primarily Hindu in the western section and mostly Muslim in the eastern half, became part of British India. Partition in 1947 resulted in an eastern wing of Pakistan in the Muslim-majority area, which became East Pakistan. Calls for greater autonomy and animosity between the eastern and western wings of Pakistan led to a Bengali independence movement. That movement, led by the Awami League (AL) and supported by India, won the independence war for Bangladesh in 1971.The post-independence AL government faced daunting challenges and in 1975 it was overthrown by the military, triggering a series of military coups that resulted in a military-backed government and subsequent creation of the Bangladesh Nationalist Party (BNP) in 1978. That government also ended in a coup in 1981, followed by military-backed rule until democratic elections occurred in 1991. The BNP and AL have alternated in power since 1991, with the exception of a military-backed, emergency caretaker regime that suspended parliamentary elections planned for January 2007 in an effort to reform the political system and root out corruption. That government returned the country to fully democratic rule in December 2008 with the election of the AL and Prime Minister Sheikh HASINA. In January 2014, the incumbent AL won the national election by an overwhelming majority after the BNP boycotted the election, which extended HASINA's term as prime minister. In December 2018, HASINA secured a third consecutive term (fourth overall) with the AL coalition securing 96% of available seats, amid widespread claims of election irregularities. With the help of international development assistance, Bangladesh has reduced the poverty rate from over half of the population to less than a third, achieved Millennium Development Goals for maternal and child health, and made great progress in food security since independence. The economy has grown at an annual average of about 6% for the last two decades and the country reached World Bank lower-middle income status in 2014.",
        region: "Asia",
        capital: "Dhaka",
        "birth rate": 18.1,
        "death rate": 5.5,
        "population growth": 0.98,
        "labor force": 66640000,
        population: 162650853,
        "median age": 27.9,
        "GDP(PPP)": 690300000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BG-flag.gif"
    },
    {
        id: "BB",
        name: "Barbados",
        background: "The island was uninhabited when first settled by the British in 1627. African slaves worked the sugar plantations established on the island, which initially dominated the Caribbean sugar industry. By 1720 Barbados was no longer a dominant force within the sugar industry, having been surpassed by the Leeward Islands and Jamaica. Slavery was abolished in 1834. The Barbadian economy remained heavily dependent on sugar, rum, and molasses production through most of the 20th century. The gradual introduction of social and political reforms in the 1940s and 1950s led to complete independence from the UK in 1966. In the 1990s, tourism and manufacturing surpassed the sugar industry in economic importance.",
        region: "Central America & The Caribbean",
        capital: "Bridgetown",
        "birth rate": 11.3,
        "death rate": 8.8,
        "population growth": 0.23,
        "labor force": 144000,
        population: 294560,
        "median age": 39.5,
        "GDP(PPP)": 5218000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BB-flag.gif"
    },
    {
        id: "BY",
        name: "Belarus",
        background: "After seven decades as a constituent republic of the USSR, Belarus attained its independence in 1991. It has retained closer political and economic ties to Russia than have any of the other former Soviet republics. Belarus and Russia signed a treaty on a two-state union on 8 December 1999 envisioning greater political and economic integration. Although Belarus agreed to a framework to carry out the accord, serious implementation has yet to take place and current negotiations on further integration have been contentious. Since his election in July 1994 as the country's first and only directly elected president, Aleksandr LUKASHENKO has steadily consolidated his power through authoritarian means and a centralized economic system. Government restrictions on political and civil freedoms, freedom of speech and the press, peaceful assembly, and religion have remained in place.",
        region: "Europe",
        capital: "Minsk",
        "birth rate": 9.5,
        "death rate": 13.1,
        "population growth": -0.27,
        "labor force": 4381000,
        population: 9477918,
        "median age": 40.9,
        "GDP(PPP)": 179400000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BO-flag.gif"
    },
    {
        id: "BE",
        name: "Belgium",
        background: "Belgium became independent from the Netherlands in 1830; it was occupied by Germany during World Wars I and II. The country prospered in the past half century as a modern, technologically advanced European state and member of NATO and the EU. In recent years, political divisions between the Dutch-speaking Flemish of the north and the French-speaking Walloons of the south have led to constitutional amendments granting these regions formal recognition and autonomy. The capital city of Brussels is home to numerous international organizations including the EU and NATO.",
        region: "Europe",
        capital: "Brussels",
        "birth rate": 11.1,
        "death rate": 9.8,
        "population growth": 0.63,
        "labor force": 5324000,
        population: 11720716,
        "median age": 41.6,
        "GDP(PPP)": 529200000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BE-flag.gif"
    },
    {
        id: "BZ",
        name: "Belize",
        background: "Belize was the site of several Mayan city states until their decline at the end of the first millennium A.D. The British and Spanish disputed the region in the 17th and 18th centuries; it formally became the colony of British Honduras in 1862. Territorial disputes between the UK and Guatemala delayed the independence of Belize until 1981. Guatemala refused to recognize the new nation until 1992 and the two countries are involved in an ongoing border dispute. Both nations have voted to send the dispute for final resolution to the International Court of Justice. Tourism has become the mainstay of the economy. Current concerns include the country's heavy foreign debt burden, high crime rates, high unemployment combined with a majority youth population, growing involvement in the Mexican and South American drug trade, and one of the highest HIV/AIDS prevalence rates in Central America.",
        region: "Central America & The Caribbean",
        capital: "Belmopan",
        "birth rate": 22,
        "death rate": 4.1,
        "population growth": 1.72,
        "labor force": 120500,
        population: 399598,
        "median age": 23.9,
        "GDP(PPP)": 3218000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BH-flag.gif"
    },
    {
        id: "BJ",
        name: "Benin",
        background: "Present day Benin was the site of Dahomey, a West African kingdom that rose to prominence in about 1600 and over the next two and a half centuries became a regional power, largely based on its slave trade. France began to control the coastal areas of Dahomey in the second half of the 19th century; the entire kingdom was conquered by 1894. French Dahomey achieved independence in 1960; it changed its name to the Republic of Benin in 1975.A succession of military governments ended in 1972 with the rise to power of Mathieu KEREKOU and the establishment of a government based on Marxist-Leninist principles. A move to representative government began in 1989. Two years later, free elections ushered in former Prime Minister Nicephore SOGLO as president, marking the first successful transfer of power in Africa from a dictatorship to a democracy. KEREKOU was returned to power by elections held in 1996 and 2001, though some irregularities were alleged. KEREKOU stepped down at the end of his second term in 2006 and was succeeded by Thomas YAYI Boni, a political outsider and independent, who won a second five-year term in March 2011. Patrice TALON, a wealthy businessman, took office in 2016 after campaigning to restore public confidence in the government.",
        region: "Africa",
        capital: "Porto-Novo",
        "birth rate": 42.1,
        "death rate": 8.4,
        "population growth": 3.4,
        "labor force": 3662000,
        population: 12864634,
        "median age": 17,
        "GDP(PPP)": 25390000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BN-flag.gif"
    },
    {
        id: "BM",
        name: "Bermuda",
        background: "Bermuda was first settled in 1609 by shipwrecked English colonists heading for Virginia. Self-governing since 1620, Bermuda is the oldest and most populous of the British overseas territories. Vacationing to the island to escape North American winters first developed in Victorian times. Tourism continues to be important to the island's economy, although international business has overtaken it in recent years. Bermuda has also developed into a highly successful offshore financial center. A referendum on independence from the UK was soundly defeated in 1995.",
        region: "North America",
        capital: "Hamilton",
        "birth rate": 11.2,
        "death rate": 9.1,
        "population growth": 0.39,
        "labor force": 33480,
        population: 71750,
        "median age": 43.6,
        "GDP(PPP)": 6127000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BD-flag.gif"
    },
    {
        id: "BT",
        name: "Bhutan",
        background: "Following Britains victory in the 1865 Duar War, Britain and Bhutan signed the Treaty of Sinchulu, under which Bhutan would receive an annual subsidy in exchange for ceding land to British India. Ugyen WANGCHUCK - who had served as the de facto ruler of an increasingly unified Bhutan and had improved relations with the British toward the end of the 19th century - was named king in 1907. Three years later, a treaty was signed whereby the British agreed not to interfere in Bhutanese internal affairs, and Bhutan allowed Britain to direct its foreign affairs. Bhutan negotiated a similar arrangement with independent India in 1949. The Indo-Bhutanese Treaty of Friendship returned to Bhutan a small piece of the territory annexed by the British, formalized the annual subsidies the country received, and defined India's responsibilities in defense and foreign relations. Under a succession of modernizing monarchs beginning in the 1950s, Bhutan joined the UN in 1971 and slowly continued its engagement beyond its borders.In 2005, King Jigme Singye WANGCHUCK unveiled the draft of Bhutan's first constitution - which introduced major democratic reforms - and held a national referendum for its approval. The King abdicated the throne in 2006 in favor of his son, Jigme Khesar Namgyel WANGCHUCK. In 2007, India and Bhutan renegotiated their treaty, eliminating the clause that stated that Bhutan would be \"guided by\" India in conducting its foreign policy, although Thimphu continues to coordinate closely with New Delhi. In 2008, Bhutan held its first parliamentary election in accordance with the constitution. Bhutan experienced a peaceful turnover of power following a parliamentary election in 2013, which resulted in the defeat of the incumbent party. In 2018, the incumbent party again lost the parliamentary election. Of the more than 100,000 ethnic Nepali - predominantly Lhotshampa - refugees who fled or were forced out of Bhutan in the 1990s, about 6,500 remain displaced in Nepal. ",
        region: "Asia",
        capital: "Thimphu",
        "birth rate": 16.3,
        "death rate": 6.3,
        "population growth": 1.02,
        "labor force": 397900,
        population: 782318,
        "median age": 29.1,
        "GDP(PPP)": 7205000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BT-flag.gif"
    },
    {
        id: "BO",
        name: "Bolivia",
        background: "Bolivia, named after independence fighter Simon BOLIVAR, broke away from Spanish rule in 1825; much of its subsequent history has consisted of a series of coups and countercoups, with the last coup occurring in 1978. Democratic civilian rule was established in 1982, but leaders have faced difficult problems of deep-seated poverty, social unrest, and illegal drug production.In December 2005, Bolivians elected Movement Toward Socialism leader Evo MORALES president - by the widest margin of any leader since the restoration of civilian rule in 1982 - after he ran on a promise to change the country's traditional political class and empower the nation's poor, indigenous majority. In December 2009 and October 2014, President MORALES easily won reelection. His party maintained control of the legislative branch of the government, which has allowed him to continue his process of change. In February 2016, MORALES narrowly lost a referendum to approve a constitutional amendment that would have allowed him to compete in the 2019 presidential election. However, a 2017 Supreme Court ruling stating that term limits violate human rights provided the justification for MORALES to be chosen by his party to run again in 2019. MORALES attempted to claim victory in the 20 October 2019 election, but widespread allegations of electoral fraud, rising violence, and pressure from the military ultimately forced him to flee the country. An interim government is preparing new elections for 2020.",
        region: "South America",
        capital: "LaPaz",
        "birth rate": 20.8,
        "death rate": 6.3,
        "population growth": 1.44,
        "labor force": 5719000,
        population: 11639909,
        "median age": 25.3,
        "GDP(PPP)": 83720000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BL-flag.gif"
    },
    {
        id: "BA",
        name: "Bosnia and Herzegovina",
        background: 'Bosnia and Herzegovina declared sovereignty in October 1991 and independence from the former Yugoslavia on 3 March 1992 after a referendum boycotted by ethnic Serbs. The Bosnian Serbs - supported by neighboring Serbia and Montenegro - responded with armed resistance aimed at partitioning the republic along ethnic lines and joining Serb-held areas to form a "Greater Serbia." In March 1994, Bosniaks and Croats reduced the number of warring factions from three to two by signing an agreement creating a joint Bosniak-Croat Federation of Bosnia and Herzegovina. On 21 November 1995, in Dayton, Ohio, the warring parties initialed a peace agreement that ended three years of interethnic civil strife (the final agreement was signed in Paris on 14 December 1995).The Dayton Peace Accords retained Bosnia and Herzegovina\'s international boundaries and created a multiethnic and democratic government charged with conducting foreign, diplomatic, and fiscal policy. Also recognized was a second tier of government composed of two entities roughly equal in size: the predominantly Bosniak-Bosnian Croat Federation of Bosnia and Herzegovina and the predominantly Bosnian Serb-led Republika Srpska (RS). The Federation and RS governments are responsible for overseeing most government functions. Additionally, the Dayton Accords established the Office of the High Representative to oversee the implementation of the civilian aspects of the agreement. The Peace Implementation Council at its conference in Bonn in 1997 also gave the High Representative the authority to impose legislation and remove officials, the so-called "Bonn Powers." An original NATO-led international peacekeeping force (IFOR) of 60,000 troops assembled in 1995 was succeeded over time by a smaller, NATO-led Stabilization Force (SFOR). In 2004, European Union peacekeeping troops (EUFOR) replaced SFOR. Currently, EUFOR deploys around 600 troops in theater in a security assistance and training capacity.',
        region: "Europe",
        capital: "Sarajevo",
        "birth rate": 8.6,
        "death rate": 10.2,
        "population growth": -0.19,
        "labor force": 1380000,
        population: 3835586,
        "median age": 43.3,
        "GDP(PPP)": 44830000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BK-flag.gif"
    },
    {
        id: "BW",
        name: "Botswana",
        background: "Formerly the British protectorate of Bechuanaland, Botswana adopted its new name at independence in 1966. More than five decades of uninterrupted civilian leadership, progressive social policies, and significant capital investment have created one of the most stable economies in Africa. The ruling Botswana Democratic Party has won every national election since independence; President Mokgweetsi Eric MASISI assumed the presidency in April 2018 following the retirement of former President Ian KHAMA due to constitutional term limits. MASISI won his first election as president in October 2019, and he is Botswanas fifth president since independence. Mineral extraction, principally diamond mining, dominates economic activity, though tourism is a growing sector due to the country's conservation practices and extensive nature preserves. Botswana has one of the world's highest rates of HIV/AIDS infection, but also one of Africa's most progressive and comprehensive programs for dealing with the disease.",
        region: "Africa",
        capital: "Gaborone",
        "birth rate": 20.9,
        "death rate": 9.2,
        "population growth": 1.48,
        "labor force": 1177000,
        population: 2317233,
        "median age": 25.7,
        "GDP(PPP)": 39010000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BC-flag.gif"
    },
    {
        id: "BR",
        name: "Brazil",
        background: "Following more than three centuries under Portuguese rule, Brazil gained its independence in 1822, maintaining a monarchical system of government until the abolition of slavery in 1888 and the subsequent proclamation of a republic by the military in 1889. Brazilian coffee exporters politically dominated the country until populist leader Getulio VARGAS rose to power in 1930. By far the largest and most populous country in South America, Brazil underwent more than a half century of populist and military government until 1985, when the military regime peacefully ceded power to civilian rulers. Brazil continues to pursue industrial and agricultural growth and development of its interior. Having successfully weathered a period of global financial difficulty in the late 20th century, Brazil was seen as one of the world's strongest emerging markets and a contributor to global growth. The awarding of the 2014 FIFA World Cup and 2016 Summer Olympic Games, the first ever to be held in South America, was seen as symbolic of the country's rise. However, from about 2013 to 2016, Brazil was plagued by a sagging economy, high unemployment, and high inflation, only emerging from recession in 2017. Former President Dilma ROUSSEFF (2011-2016) was removed from office in 2016 by Congress for having committed impeachable acts against Brazil's budgetary laws, and her vice president, Michel TEMER, served the remainder of her second term. In October 2018, Jair BOLSONARO won the presidency with 55 percent of the vote and assumed office on 1 January 2019.",
        region: "South America",
        capital: "Brasilia",
        "birth rate": 13.6,
        "death rate": 6.9,
        "population growth": 0.67,
        "labor force": 104200000,
        population: 211715973,
        "median age": 33.2,
        "GDP(PPP)": 3248000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BR-flag.gif"
    },
    {
        id: "VG",
        name: "British Virgin Islands",
        background: "First inhabited by Arawak and later by Carib Indians, the Virgin Islands were settled by the Dutch in 1648 and then annexed by the English in 1672. The islands were part of the British colony of the Leeward Islands from 1872-1960; they were granted autonomy in 1967. The economy is closely tied to the larger and more populous US Virgin Islands to the west; the US dollar is the legal currency. On 6 September 2017, Hurricane Irma devastated the island of Tortola. An estimated 80% of residential and business structures were destroyed or damaged, communications disrupted, and local roads rendered impassable.",
        region: "Central America & The Caribbean",
        capital: "Road Town",
        "birth rate": 11.1,
        "death rate": 5.4,
        "population growth": 2.14,
        "labor force": 12770,
        population: 37381,
        "median age": 37.2,
        "GDP(PPP)": 500000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/VI-flag.gif"
    },
    {
        id: "BN",
        name: "Brunei",
        background: "The Sultanate of Brunei's influence peaked between the 15th and 17th centuries when its control extended over coastal areas of northwest Borneo and the southern Philippines. Brunei subsequently entered a period of decline brought on by internal strife over royal succession, colonial expansion of European powers, and piracy. In 1888, Brunei became a British protectorate; independence was achieved in 1984. The same family has ruled Brunei for over six centuries. Brunei benefits from extensive petroleum and natural gas fields, the source of one of the highest per capita GDPs in the world. In 2017, Brunei celebrated the 50th anniversary of the Sultan Hassanal BOLKIAHs accession to the throne.",
        region: "Asia",
        capital: "Bandar Seri Begawan",
        "birth rate": 16.5,
        "death rate": 3.8,
        "population growth": 1.51,
        "labor force": 203600,
        population: 464478,
        "median age": 31.1,
        "GDP(PPP)": 33870000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BX-flag.gif"
    },
    {
        id: "BG",
        name: "Bulgaria",
        background: "The Bulgars, a Central Asian Turkic tribe, merged with the local Slavic inhabitants in the late 7th century to form the first Bulgarian state. In succeeding centuries, Bulgaria struggled with the Byzantine Empire to assert its place in the Balkans, but by the end of the 14th century the country was overrun by the Ottoman Turks. Northern Bulgaria attained autonomy in 1878 and all of Bulgaria became independent from the Ottoman Empire in 1908. Having fought on the losing side in both World Wars, Bulgaria fell within the Soviet sphere of influence and became a People's Republic in 1946. Communist domination ended in 1990, when Bulgaria held its first multiparty election since World War II and began the contentious process of moving toward political democracy and a market economy while combating inflation, unemployment, corruption, and crime. The country joined NATO in 2004 and the EU in 2007.",
        region: "Europe",
        capital: "Sofia",
        "birth rate": 8.3,
        "death rate": 14.6,
        "population growth": -0.65,
        "labor force": 3357000,
        population: 6966899,
        "median age": 43.7,
        "GDP(PPP)": 153500000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BU-flag.gif"
    },
    {
        id: "BF",
        name: "Burkina Faso",
        background: "Burkina Faso (formerly Upper Volta) achieved independence from France in 1960. Repeated military coups during the 1970s and 1980s were followed by multiparty elections in the early 1990s. Former President Blaise COMPAORE (1987-2014) resigned in late October 2014 following popular protests against his efforts to amend the constitution's two-term presidential limit. An interim administration organized presidential and legislative elections - held in November 2015 - where Roch Marc Christian KABORE was elected president. The country experienced terrorist attacks in its capital in 2016, 2017, and 2018, and terrorist attacks in the country's northern and eastern regions resulted in more than 1,800 deaths and over 500,000 internally displaced persons in 2019. The Government of Burkina Faso has made numerous arrests of terrorist suspects, augmented the size of its special terrorism detachment Groupement des Forces Anti-Terroristes (GFAT) in the countrys north, and joined the newly-created G5 Sahel Joint Force to fight terrorism and criminal trafficking groups with regional neighbors Chad, Mali, Mauritania, and Niger. Burkina Faso's high population growth, recurring drought, pervasive and perennial food insecurity, and limited natural resources result in poor economic prospects for the majority of its citizens.(2019)",
        region: "Africa",
        capital: "Ouagadougou",
        "birth rate": 35.1,
        "death rate": 8.2,
        "population growth": 2.66,
        "labor force": 8501000,
        population: 20835401,
        "median age": 17.9,
        "GDP(PPP)": 35850000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/UV-flag.gif"
    },
    {
        id: "MM",
        name: "Myanmar",
        background: "Various ethnic Burman and ethnic minority city-states or kingdoms occupied the present borders through the 19th century, and several minority ethnic groups continue to maintain independent armies and control territory within the country today, in opposition to the central government. Over a period of 62 years (1824-1886), Britain conquered Burma and incorporatedall the groups withinthe country into its Indian Empire. Burma was administered as a province of India until 1937 when it became a separate, self-governing colony; in 1948,following major battles on its territory during World War II,Burma attained independence from the British Commonwealth. Gen. NE WIN dominated the government from 1962 to 1988, first as military ruler, then as self-appointed president, and later as political kingpin. In response to widespread civil unrest, NE WIN resigned in 1988, but within months the military crushed student-led protests and took power. Since independence, successiveBurmesegovernments have fought on-and-off conflicts with armed ethnic groupsseeking autonomyin the countrys mountainous border regions.Multiparty legislative elections in 1990 resulted in the main opposition party - the National League for Democracy (NLD) - winning a landslide victory. Instead of handing over power, the junta placed NLD leader (and 1991 Nobel Peace Prize recipient) AUNG SAN SUU KYI under house arrest from 1989 to 1995, 2000 to 2002, and from May 2003 to November 2010. In late September 2007, the ruling junta brutally suppressed protests over increased fuel prices led by prodemocracy activists and Buddhist monks, killing an unknown number of people and arresting thousands for participating in the demonstrations - popularly referred to as the Saffron Revolution. In early May 2008, CycloneNargisstruck Burma, which left over 138,000 dead and tens of thousands injured and homeless. Despite this tragedy, the junta proceeded with its May constitutional referendum, the first vote in Burma since 1990. The 2008 constitution reserves 25% of its seats to the military. Legislative elections held in November 2010, which the NLD boycotted and many in the international community considered flawed, saw the successor ruling junta's mass organization, the Union Solidarity and Development Party garner over 75% of the contested seats.The national legislature convened in January 2011 and selected former Prime Minister THEIN SEIN as president. Although the vast majority of national-level appointees named by THEIN SEIN were former or current military officers, the government initiated a series of political and economic reforms leading to a substantial opening of the long-isolated country. These reforms included releasing hundreds of political prisoners, signing a nationwide cease-fire with several of the country's ethnic armed groups, pursuing legal reform, and gradually reducing restrictions on freedom of the press, association, and civil society. At least due in part to these reforms, AUNG SAN SUU KYI was elected to the national legislature in April 2012 and became chair of the Committee for Rule of Law and Tranquility. Burma served as chair of the Association of Southeast Asian Nations (ASEAN) for 2014. In a flawed but largely credible national legislative election in November 2015 featuring more than 90 political parties, the NLD again won a landslide victory. Using its overwhelming majority in both houses of parliament, the NLD elected HTIN KYAW, AUNG SAN SUU KYIs confidant and long-time NLD supporter, as president. The new legislature created the position of State Counsellor, according AUNG SAN SUU KYI a formal role in the government and making her the de facto head of state. Burma's first credibly elected civilian government after more than five decades of military dictatorship was sworn into office on 30 March 2016. In March 2018, upon HTIN KYAWs resignation, parliament selected WIN MYINT, another long-time ally of AUNG SAN SUU KYIs, as president.Attacks in October 2016 and August 2017 on security forces in northern Rakhine State by members of theArakanRohingya Salvation Army (ARSA), a Rohingya militant group, resulted in military crackdowns on the Rohingya populationthat reportedly caused thousands of deathsand human rights abuses. Following the August 2017 violence, over 740,000 Rohingya fledto neighboring Bangladesh as refugees. In November 2017, the US Department of State determined that the August 2017 violence constituted ethnic cleansingof Rohingyas. The UN has called for Burma to allow access to a Fact Finding Mission to investigate reports of human rights violations and abuses and to work with Bangladesh to facilitate repatriation of Rohingya refugees, and in September 2018 the International Criminal Court(ICC)determined it had jurisdiction to investigatereported human rightsabusesagainst Rohingyas. Burmahasrejected charges of ethnic cleansingand genocide,and has chosen not to work with the UN Fact Finding Missionor the ICC. In March 2018, President HTIN KYAW announced his voluntary retirement; NLD parliamentarian WIN MYINT was named by the parliament as his successor. In February 2019, the NLD announced it would establish a parliamentary committee to examine options for constitutional reformahead of national the elections planned for 2020.",
        region: "Asia",
        capital: "Rangoon",
        "birth rate": 17,
        "death rate": 7.2,
        "population growth": 0.85,
        "labor force": 22300000,
        population: 56590071,
        "median age": 29.2,
        "GDP(PPP)": 329800000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BM-flag.gif"
    },
    {
        id: "BI",
        name: "Burundi",
        background: "Burundi is a small country in Central-East Africa bordered by Tanzania, Rwanda, the Democratic Republic of Congo, and Lake Tanganyika. Burundi gained its independence from Belgium in 1962 as the Kingdom of Burundi, but the monarchy was overthrown in 1966 and a republic established. Political violence and non-democratic transfers of power have marked much of its history; Burundi's first democratically elected president, a Hutu, was assassinated in October 1993 after only 100 days in office. The internationally brokered Arusha Agreement, signed in 2000, and subsequent ceasefire agreements with armed movements ended the 1993-2005 civil war. Burundis second democratic elections were held in 2005. Pierre NKURUNZIZA was elected president in 2005 and 2010, and again in a controversial election in 2015. Burundi continues to face many economic and political challenges.",
        region: "Africa",
        capital: "Gitega",
        "birth rate": 36.5,
        "death rate": 6.2,
        "population growth": 2.85,
        "labor force": 5012000,
        population: 11865821,
        "median age": 17.7,
        "GDP(PPP)": 8007000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BY-flag.gif"
    },
    {
        id: "CV",
        name: "Cabo Verde",
        background: "The uninhabited islands were discovered and colonized by the Portuguese in the 15th century; Cabo Verde subsequently became a trading center for African slaves and later an important coaling and resupply stop for whaling and transatlantic shipping. The fusing of European and various African cultural traditions is reflected in Cabo Verdes Krioulo language, music, and pano textiles. Following independence in 1975, and a tentative interest in unification with Guinea-Bissau, a one-party system was established and maintained until multi-party elections were held in 1990. Cabo Verde continues to sustain one of Africa's most stable democratic governments and one of its most stable economies, maintaining a currency formerly pegged to the Portuguese escudo and then the euro since 1998. Repeated droughts during the second half of the 20th century caused significant hardship and prompted heavy emigration. As a result, Cabo Verde's expatriate population - concentrated in Boston and Western Europe - is greater than its domestic one. Most Cabo Verdeans have both African and Portuguese antecedents. Cabo Verdes population descends from its first permanent inhabitants in the late 15th-century  a preponderance of West African slaves, a small share of Portuguese colonists, and even fewer Italians, Spaniards, and Portuguese Jews. Among the nine inhabited islands, population distribution is variable. Islands in the east are very dry and are home to the country's growing tourism industry. The more western islands receive more precipitation and support larger populations, but agriculture and livestock grazing have damaged their soil fertility and vegetation. For centuries, the countrys overall population size has fluctuated significantly, as recurring periods of famine and epidemics have caused high death tolls and emigration.",
        region: "Africa",
        capital: "Praia",
        "birth rate": 19.1,
        "death rate": 5.9,
        "population growth": 1.28,
        "labor force": 196100,
        population: 583255,
        "median age": 26.8,
        "GDP(PPP)": 3777000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CV-flag.gif"
    },
    {
        id: "KH",
        name: "Cambodia",
        background: "Most Cambodians consider themselves to be Khmers, descendants of the Angkor Empire that extended over much of Southeast Asia and reached its zenith between the 10th and 13th centuries. Attacks by the Thai and Cham (from present-day Vietnam) weakened the empire, ushering in a long period of decline. The king placed the country under French protection in 1863, and it became part of French Indochina in 1887. Following Japanese occupation in World War II, Cambodia gained full independence from France in 1953. In April 1975, after a seven-year struggle, communist Khmer Rouge forces captured Phnom Penh and evacuated all cities and towns. At least 1.5 million Cambodians died from execution, forced hardships, or starvation during the Khmer Rouge regime under POL POT. A December 1978 Vietnamese invasion drove the Khmer Rouge into the countryside, began a 10-year Vietnamese occupation, and touched off 20 years of civil war.The 1991 Paris Peace Accords mandated democratic elections and a cease-fire, which was not fully respected by the Khmer Rouge. UN-sponsored elections in 1993 helped restore some semblance of normalcy under a coalition government. Factional fighting in 1997 ended the first coalition government, but a second round of national elections in 1998 led to the formation of another coalition government and renewed political stability. The remaining elements of the Khmer Rouge surrendered in early 1999. Some of the surviving Khmer Rouge leaders were tried for crimes against humanity by a hybrid UN-Cambodian tribunal supported by international assistance. In 2018, the tribunal heard its final cases, but it remains in operation to hear appeals. Elections in July 2003 were relatively peaceful, but it took one year of negotiations between contending political parties before a coalition government was formed. In October 2004, King Norodom SIHANOUK abdicated the throne and his son, Prince Norodom SIHAMONI, was selected to succeed him. Local (Commune Council) elections were held in Cambodia in 2012, with little of the violence that preceded prior elections. National elections in July 2013 were disputed, with the opposition - the Cambodia National Rescue Party (CNRP) - boycotting the National Assembly. The political impasse was ended nearly a year later, with the CNRP agreeing to enter parliament in exchange for commitments by the ruling Cambodian Peoples Party (CPP) to electoral and legislative reforms. The CNRP made further gains in local commune elections in June 2017, accelerating sitting Prime Minister Hun SENs efforts to marginalize the CNRP before national elections in 2018. Hun Sen arrested CNRP President Kem SOKHA in September 2017. The Supreme Court dissolved the CNRP in November 2017 and banned its leaders from participating in politics for at least five years. The CNRPs seats in the National Assembly were redistributed to smaller, less influential opposition parties, while all of the CNRPs 5,007 seats in the commune councils throughout the country were reallocated to the CPP. With the CNRP banned, the CPP swept the 2018 national elections, winning all 125 National Assembly seats and effectively turning the country into a one-party state.",
        region: "Asia",
        capital: "Phnom Penh",
        "birth rate": 21.3,
        "death rate": 7.3,
        "population growth": 1.4,
        "labor force": 8913000,
        population: 16926984,
        "median age": 26.4,
        "GDP(PPP)": 64210000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CB-flag.gif"
    },
    {
        id: "CM",
        name: "Cameroon",
        background: "French Cameroon became independent in 1960 as the Republic of Cameroon. The following year the southern portion of neighboring British Cameroon voted to merge with the new country to form the Federal Republic of Cameroon. In 1972, a new constitution replaced the federation with a unitary state, the United Republic of Cameroon. The country has generally enjoyed stability, which has enabled the development of agriculture, roads, and railways, as well as a petroleum industry. Despite slow movement toward democratic reform, political power remains firmly in the hands of President Paul BIYA.",
        region: "Africa",
        capital: "Yaounde",
        "birth rate": 36.3,
        "death rate": 8.1,
        "population growth": 2.78,
        "labor force": 9912000,
        population: 27744989,
        "median age": 18.5,
        "GDP(PPP)": 89540000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CM-flag.gif"
    },
    {
        id: "CA",
        name: "Canada",
        background: "A land of vast distances and rich natural resources, Canada became a self-governing dominion in 1867, while retaining ties to the British crown. Canada repatriated its constitution from the UK in 1982, severing a final colonial tie. Economically and technologically, the nation has developed in parallel with the US, its neighbor to the south across the world's longest international border. Canada faces the political challenges of meeting public demands for quality improvements in health care, education, social services, and economic competitiveness, as well as responding to the particular concerns of predominantly francophone Quebec. Canada also aims to develop its diverse energy resources while maintaining its commitment to the environment.",
        region: "North America",
        capital: "Ottawa",
        "birth rate": 10.2,
        "death rate": 7.9,
        "population growth": 0.81,
        "labor force": 19520000,
        population: 37694085,
        "median age": 41.8,
        "GDP(PPP)": 1774000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CA-flag.gif"
    },
    {
        id: "KY",
        name: "Cayman Islands",
        background: "The Cayman Islands were colonized from Jamaica by the British during the 18th and 19th centuries and were administered by Jamaica after 1863. In 1959, the islands became a territory within the Federation of the West Indies. When the Federation dissolved in 1962, the Cayman Islands chose to remain a British dependency. The territory has transformed itself into a significant offshore financial center.",
        region: "Central America & The Caribbean",
        capital: "George Town",
        "birth rate": 11.9,
        "death rate": 6.1,
        "population growth": 1.9,
        "labor force": 39000,
        population: 61944,
        "median age": 40.5,
        "GDP(PPP)": 2507000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CJ-flag.gif"
    },
    {
        id: "CF",
        name: "Central African Republic",
        background: "The former French colony of Ubangi-Shari became the Central African Republic upon independence in 1960. After three tumultuous decades of misrule - mostly by military governments - civilian rule was established in 1993 but lasted only a decade. In March 2003, President Ange-Felix PATASSE was deposed in a military coup led by General Francois BOZIZE, who established a transitional government. Elections held in 2005 affirmed General BOZIZE as president; he was reelected in 2011 in voting widely viewed as flawed. The government still lacks full control of the countryside, where lawlessness persists. Several rebel groups joined together in early December 2012 to launch a series of attacks that left them in control of numerous towns in the northern and central parts of the country. The rebels - unhappy with BOZIZE's government - participated in peace talks in early January 2013 which resulted in a coalition government including the rebellion's leadership. In March 2013, the coalition government dissolved, rebels seized the capital, and President BOZIZE fled the country. Rebel leader Michel DJOTODIA assumed the presidency and the following month established a National Transitional Council (CNT). In January 2014, the CNT elected Catherine SAMBA-PANZA as interim president. Elections completed in March 2016 installed independent candidate Faustin-Archange TOUADERA as president; he continues to work towards peace between the government and armed groups, and is developing a disarmament, demobilization, reintegration, and repatriation program to reintegrate the armed groups into society.",
        region: "Africa",
        capital: "Bangui",
        "birth rate": 33.2,
        "death rate": 12.3,
        "population growth": 2.09,
        "labor force": 2242000,
        population: 5990855,
        "median age": 20,
        "GDP(PPP)": 3390000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CT-flag.gif"
    },
    {
        id: "TD",
        name: "Chad",
        background: "Chad, part of France's African holdings until 1960, endured three decades of civil warfare, as well as invasions by Libya, before peace was restored in 1990. The government eventually drafted a democratic constitution and held flawed presidential elections in 1996 and 2001. In 1998, a rebellion broke out in northern Chad, which has sporadically flared up despite several peace agreements between the government and insurgents. In June 2005, President Idriss DEBY held a referendum successfully removing constitutional term limits and won another controversial election in 2006. Sporadic rebel campaigns continued throughout 2006 and 2007. The capital experienced a significant insurrection in early 2008, but has had no significant rebel threats since then, in part due to Chad's 2010 rapprochement with Sudan, which previously used Chadian rebels as proxies. Nevertheless, a state of emergency continues to be in place in the Sila and Ouaddai regions bordering Sudan. In late 2015, the government imposed a state of emergency in the Lake Chad region following multiple attacks by the terrorist group Boko Haram throughout the year; Boko Haram also launched several bombings in N'Djamena in mid-2015. A state of emergency is also emplaced in the western Tibesti region bordering Niger where rival ethnic groups are fighting. DEBY in 2016 was reelected to his fifth term in an election that was peaceful but flawed. In December 2015, Chad completed a two-year rotation on the UN Security Council. In January 2017, DEBY completed a one-year term asChairperson of the African Union Assembly.(2019)",
        region: "Africa",
        capital: "N'Djamena",
        "birth rate": 41.7,
        "death rate": 10,
        "population growth": 3.18,
        "labor force": 5654000,
        population: 16877357,
        "median age": 16.1,
        "GDP(PPP)": 28620000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CD-flag.gif"
    },
    {
        id: "CL",
        name: "Chile",
        background: "Prior to the arrival of the Spanish in the 16th century, the Inca ruled northern Chile for nearly a century while an indigenous people, the Mapuche, inhabited central and southern Chile. Although Chile declared its independence in 1810, it did not achieve decisive victory over the Spanish until 1818. In the War of the Pacific (1879-83), Chile defeated Peru and Bolivia to win its present northern regions. In the 1880s, the Chilean central government gained control over the central and southern regions inhabited by the Mapuche. After a series of elected governments, the three-year-old Marxist government of Salvador ALLENDE was overthrown in 1973 by a military coup led by General Augusto PINOCHET, who ruled until a democratically-elected president was inaugurated in 1990. Economic reforms, maintained consistently since the 1980s, contributed to steady growth, reduced poverty rates by over half, and helped secure the country's commitment to democratic and representative government. Chile has increasingly assumed regional and international leadership roles befitting its status as a stable, democratic nation.",
        region: "South America",
        capital: "Santiago",
        "birth rate": 13.1,
        "death rate": 6.5,
        "population growth": 0.71,
        "labor force": 8881000,
        population: 18186770,
        "median age": 35.5,
        "GDP(PPP)": 452100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CI-flag.gif"
    },
    {
        id: "CN",
        name: "China",
        background: "China's historical civilization dates from at least 1200 B.C.; from the 3rd century B.C. and for the next two millennia, China alternated between periods of unity and disunity under a succession of imperial dynasties. In the 19th and early 20th centuries, the country was beset by civil unrest, major famines, military defeats, and foreign occupation. After World War II, the Chinese Communist Party under MAO Zedong established an autocratic socialist system that, while ensuring China's sovereignty, imposed strict controls over everyday life and cost the lives of tens of millions of people. After 1978, MAO's successor DENG Xiaoping and other leaders focused on market-oriented economic development and by 2000 output had quadrupled. For much of the population, living standards have improved dramatically but political controls remain tight. Since the early 1990s, China has increased its global outreach and participation in international organizations.",
        region: "Asia",
        capital: "Beijing",
        "birth rate": 11.6,
        "death rate": 8.2,
        "population growth": 0.32,
        "labor force": 806700000,
        population: 1394015977,
        "median age": 38.4,
        "GDP(PPP)": 25360000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CH-flag.gif"
    },
    {
        id: "CO",
        name: "Colombia",
        background: "Colombia was one of the three countries that emerged after the dissolution of Gran Colombia in 1830 (the others are Ecuador and Venezuela). A decades-long conflict between government forces, paramilitaries, and antigovernment insurgent groups heavily funded by the drug trade, principally the Revolutionary Armed Forces of Colombia (FARC), escalated during the 1990s. More than 31,000 former United Self Defense Forces of Colombia (AUC) paramilitaries demobilized by the end of 2006, and the AUC as a formal organization ceased to operate. In the wake of the paramilitary demobilization, illegal armed groups arose, whose members include some former paramilitaries. After four years of formal peace negotiations, the Colombian Government signed a final peace accord with the FARC in November 2016, which was subsequently ratified by the Colombian Congress. The accord calls for members of the FARC to demobilize, disarm, and reincorporate into society and politics. The accord also committed the Colombian Government to create three new institutions to form a 'comprehensive system for truth, justice, reparation, and non-repetition,' to include a truth commission, a special unit to coordinate the search for those who disappeared during the conflict, and a 'Special Jurisdiction for Peace' to administer justice for conflict-related crimes. The Colombian Government has stepped up efforts to expand its presence into every one of its administrative departments. Despite decades of internal conflict and drug-related security challenges, Colombia maintains relatively strong democratic institutions characterized by peaceful, transparent elections and the protection of civil liberties.",
        region: "South America",
        capital: "Bogota",
        "birth rate": 15.4,
        "death rate": 5.6,
        "population growth": 0.93,
        "labor force": 25760000,
        population: 49084841,
        "median age": 31.2,
        "GDP(PPP)": 711600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CO-flag.gif"
    },
    {
        id: "KM",
        name: "Comoros",
        background: "The archipelago of the Comoros in the Indian Ocean, composed of the islands of Mayotte, Anjouan, Moheli, and Grande Comore declared independence from France on 6 July 1975. Residents of Mayotte voted to remain in France, and France now has classified it as a department of France. Since independence, Comoros has endured political instability through realized and attempted coups. In 1997, the islands of Anjouan and Moheli declared independence from Comoros. In 1999, military chief Col. AZALI Assoumani seized power of the entire government in a bloodless coup; he initiated the 2000 Fomboni Accords, a power-sharing agreement in which the federal presidency rotates among the three islands, and each island maintains its local government. AZALI won the 2002 federal presidential election as president of the Union of the Comoros from Grande Comore Island, which held the first four-year term. AZALI stepped down in 2006 and President Ahmed Abdallah Mohamed SAMBI was elected to office as president from Anjouan. In 2007, Mohamed BACAR effected Anjouan's de-facto secession from the Union of the Comoros, refusing to step down when Comoros' other islands held legitimate elections in July. The African Union (AU) initially attempted to resolve the political crisis by applying sanctions and a naval blockade to Anjouan, but in March 2008 the AU and Comoran soldiers seized the island. The island's inhabitants generally welcomed the move. In 2009, the Comorian population approved a constitutional referendum extending the term of the president from four years to five years. In May 2011, Ikililou DHOININE won the presidency in peaceful elections widely deemed to be free and fair. In closely contested elections in 2016, former President AZALI Assoumani won a second term, when the rotating presidency returned to Grande Comore.A new constitution was passed in July2018, in a vote boycotted by the opposition, whichallowed for two consecutive five-year presidential terms and abolished the island specific vice presidents. Under the new constitution, the incumbent president can run for a second term against candidates from the next island in line for the rotation. In August 2018,President AZALI formed a new government and subsequently ran and was elected president in March 2019.",
        region: "Africa",
        capital: "Moroni",
        "birth rate": 23.6,
        "death rate": 6.9,
        "population growth": 1.47,
        "labor force": 278500,
        population: 846281,
        "median age": 20.9,
        "GDP(PPP)": 1319000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CN-flag.gif"
    },
    {
        id: "CD",
        name: "Democratic Republic of the Congo",
        background: "Established as an official Belgian colony in 1908, the then-Republic of the Congo gained its independence in 1960, but its early years were marred by political and social instability. Col. Joseph MOBUTU seized power and declared himself president in a November 1965 coup. He subsequently changed his name - to MOBUTU Sese Seko - as well as that of the country - to Zaire. MOBUTU retained his position for 32 years through several sham elections, as well as through brutal force. Ethnic strife and civil war, touched off by a massive inflow of refugees in 1994 from conflict in Rwanda and Burundi, led in May 1997 to the toppling of the MOBUTU regime by a rebellion backed by Rwanda and Uganda and fronted by Laurent KABILA. KABILA renamed the country the Democratic Republic of the Congo (DRC), but in August 1998 his regime was itself challenged by a second insurrection again backed by Rwanda and Uganda. Troops from Angola, Chad, Namibia, Sudan, and Zimbabwe intervened to support KABILA's regime. In January 2001, KABILA was assassinated and his son, Joseph KABILA, was named head of state. In October 2002, the new president was successful in negotiating the withdrawal of Rwandan forces occupying the eastern DRC; two months later, the Pretoria Accord was signed by all remaining warring parties to end the fighting and establish a government of national unity. Presidential, National Assembly, and provincial legislatures took place in 2006, with Joseph KABILA elected to office.National elections were held in November 2011 and disputed results allowed Joseph KABILA to be reelected to the presidency. While the DRC constitution barred President KABILA from running for a third term, the DRC Government delayed national elections originally slated for November 2016, to 30 December 2018. This failure to hold elections as scheduled fueled significant civil and political unrest, with sporadic street protests by KABILAs opponents and exacerbation of tensions in the tumultuous eastern DRC regions. Presidential, legislative, and provincial elections were held in late December 2018 and early 2019 across most of the country. The DRC Government canceled presidential elections in the cities of Beni and Butembo (citing concerns over an ongoing Ebola outbreak in the region) as well as Yumbi (which had recently experienced heavy violence).Opposition candidate Felix TSHISEKEDI was announced the election winner on 10 January 2019 and inaugurated two weeks later. This was the first transfer of power to an opposition candidate without significant violence or a coup since the DRC's independence.The DRC, particularly in the East, continues to experience violence perpetrated by more than 100 armed groups active in the region, including the Allied Democratic Forces (ADF), the Democratic Forces for the Liberation of Rwanda (FDLR), and assorted Mai Mai militias. The UN Organization Stabilization Mission in the DRC (MONUSCO) has operated in the region since 1999 and is the largest and most expensive UN peacekeeping mission in the world.",
        region: "Africa",
        capital: "Kinshasa",
        "birth rate": 41,
        "death rate": 8.4,
        "population growth": 3.18,
        "labor force": 31360000,
        population: 101780263,
        "median age": 16.7,
        "GDP(PPP)": 68600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CG-flag.gif"
    },
    {
        id: "CG",
        name: "Republic of the Congo",
        background: "Upon independence in 1960, the former French region of Middle Congo became the Republic of the Congo. A quarter century of experimentation with Marxism was abandoned in 1990 and a democratically elected government took office in 1992. A two-year civil war that ended in 1999 restored former Marxist President Denis SASSOU-Nguesso, who had ruled from 1979 to 1992, and sparked a short period of ethnic and political unrest that was resolved by a peace agreement in late 1999. A new constitution adopted three years later provided for a multi-party system and a seven-year presidential term, and elections arranged shortly thereafter installed SASSOU-Nguesso. Following a year of renewed fighting, President SASSOU-Nguesso and southern-based rebel groups agreed to a final peace accord in March 2003. SASSOU-Nguesso was reeelected in 2009 and, after passing a referendum allowing him to run for a third term, was reelected again in 2016. The Republic of Congo is one of Africa's largest petroleum producers, but with declining production it will need new offshore oil finds to sustain its oil earnings over the long term.",
        region: "Africa",
        capital: "Brazzaville",
        "birth rate": 32.6,
        "death rate": 8.7,
        "population growth": 2.26,
        "labor force": 2055000,
        population: 5293070,
        "median age": 19.5,
        "GDP(PPP)": 29390000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CF-flag.gif"
    },
    {
        id: "CK",
        name: "Cook Islands",
        background: "The Cook Islands, named after Captain James Cook who landed in 1773, became a British protectorate in 1888 and was later annexed by proclamation in 1900. The Cook Islands was first included within the boundaries of New Zealand in 1901, and in 1965, residents chose self-government in free association with New Zealand. The Cook Islands economy relies on tourism, fisheries, and foreign aid. More recently a growing offshore financial sector exposed the country to vulnerabilities which the government has addressed with legislation and regulations for the oversight of all banks and financial institutions, and with enforcement measures. The Cook Islands continues to face challenges with the emigration of skilled workers, government deficits, inadequate infrastructure, and natural resource depletion. The Cook Islands is expected to graduate to the high-income threshold set by the World Bank, which will limit the countrys access to Official Development Assistance under OECD guidelines.",
        region: "Oceania",
        capital: "Avarua",
        "birth rate": 13.3,
        "death rate": 9,
        "population growth": -2.59,
        "labor force": 6820,
        population: 8574,
        "median age": 38.3,
        "GDP(PPP)": 299900000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CW-flag.gif"
    },
    {
        id: "CR",
        name: "Costa Rica",
        background: "Although explored by the Spanish early in the 16th century, initial attempts at colonizing Costa Rica proved unsuccessful due to a combination of factors, including disease from mosquito-infested swamps, brutal heat, resistance by natives, and pirate raids. It was not until 1563 that a permanent settlement of Cartago was established in the cooler, fertile central highlands. The area remained a colony for some two and a half centuries. In 1821, Costa Rica became one of several Central American provinces that jointly declared their independence from Spain. Two years later it joined the United Provinces of Central America, but this federation disintegrated in 1838, at which time Costa Rica proclaimed its sovereignty and independence. Since the late 19th century, only two brief periods of violence have marred the country's democratic development. On 1 December 1948, Costa Rica dissolved its armed forces. Although it still maintains a large agricultural sector, Costa Rica has expanded its economy to include strong technology and tourism industries. The standard of living is relatively high. Land ownership is widespread.",
        region: "Central America & The Caribbean",
        capital: "SanJose",
        "birth rate": 14.8,
        "death rate": 4.9,
        "population growth": 1.08,
        "labor force": 2229000,
        population: 5097988,
        "median age": 32.6,
        "GDP(PPP)": 83940000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CS-flag.gif"
    },
    {
        id: "CI",
        name: "Cote d'Ivoire",
        background: "Close ties to France following independence in 1960, the development of cocoa production for export, and foreign investment all made Cote d'Ivoire one of the most prosperous of the West African states but did not protect it from political turmoil. In December 1999, a military coup - the first ever in Cote d'Ivoire's history - overthrew the government. Junta leader Robert GUEI attempted to rig the elections held in late 2000 and declared himself the winner. Popular protest forced him to step aside and an election brought Laurent GBAGBO into power. Ivoirian dissidents and disaffected members of the military launched a failed coup attempt in September 2002 that developed into a rebellion and then a civil war. In 2003, a cease-fire resulted in the country being divided with the rebels holding the north, the government the south, and peacekeeping forces a buffer zone between the two. In March 2007, President GBAGBO and former New Forces rebel leader Guillaume SORO signed an agreement in which SORO joined GBAGBO's government as prime minister and the two agreed to reunite the country by dismantling the buffer zone, integrating rebel forces into the national armed forces, and holding elections. Difficulties in preparing electoral registers delayed balloting until 2010. In November 2010, Alassane Dramane OUATTARA won the presidential election over GBAGBO, but GBAGBO refused to hand over power, resulting in a five-month resumption of violent conflict. In April 2011, after widespread fighting, GBAGBO was formally forced from office by armed OUATTARA supporters with the help of UN and French forces. OUATTARA won a second term in 2015 and is focused on rebuilding the country's economy and infrastructure while reforming the security forces. The UN peacekeeping mission departed in June 2017. GBAGBO was in The Hague on trial for crimes against humanity, but was acquitted in January 2019. Cte dIvoire is scheduled to hold presidential elections in November 2020.",
        region: "Africa",
        capital: "Yamoussoukro",
        "birth rate": 29.1,
        "death rate": 7.9,
        "population growth": 2.26,
        "labor force": 8747000,
        population: 27481086,
        "median age": 20.3,
        "GDP(PPP)": 97160000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/IV-flag.gif"
    },
    {
        id: "HR",
        name: "Croatia",
        background: "The lands that today comprise Croatia were part of the Austro-Hungarian Empire until the close of World War I. In 1918, the Croats, Serbs, and Slovenes formed a kingdom known after 1929 as Yugoslavia. Following World War II, Yugoslavia became a federal independent communist state consisting of six socialist republics under the strong hand of Marshal Josip Broz, aka TITO. Although Croatia declared its independence from Yugoslavia in 1991, it took four years of sporadic, but often bitter, fighting before occupying Yugoslav forces, dominated by Serb officers, were mostly cleared from Croatian lands, along with a majority of Croatia's ethnic Serb population. Under UN supervision, the last Serb-held enclave in eastern Slavonia was returned to Croatia in 1998. The country joined NATO in April 2009 and the EU in July 2013.",
        region: "Europe",
        capital: "Zagreb",
        "birth rate": 8.7,
        "death rate": 12.8,
        "population growth": -0.5,
        "labor force": 1559000,
        population: 4227746,
        "median age": 43.9,
        "GDP(PPP)": 102100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/HR-flag.gif"
    },
    {
        id: "CU",
        name: "Cuba",
        background: 'The native Amerindian population of Cuba began to decline after the European discovery of the island by Christopher COLUMBUS in 1492 and following its development as a Spanish colony during the next several centuries. Large numbers of African slaves were imported to work the coffee and sugar plantations, and Havana became the launching point for the annual treasure fleets bound for Spain from Mexico and Peru. Spanish rule eventually provoked an independence movement and occasional rebellions were harshly suppressed. US intervention during the Spanish-American War in 1898 assisted the Cubans in overthrowing Spanish rule. The Treaty of Paris established Cuban independence from Spain in 1898 and, following three-and-a-half years of subsequent US military rule, Cuba became an independent republic in 1902 after which the island experienced a string of governments mostly dominated by the military and corrupt politicians. Fidel CASTRO led a rebel army to victory in 1959; his authoritarian rule held the subsequent regime together for nearly five decades. He stepped down as president in February 2008 in favor of his younger brother Raul CASTRO. Cuba\'s communist revolution, with Soviet support, was exported throughout Latin America and Africa during the 1960s, 1970s, and 1980s. Miguel DIAZ-CANEL Bermudez, hand-picked by Raul CASTRO to succeed him, was approved as president by the National Assembly and took office on 19 April 2018.The country faced a severe economic downturn in 1990 following the withdrawal of former Soviet subsidies worth $4-6 billion annually. Cuba traditionally and consistently portrays the US embargo, in place since 1961, as the source of its difficulties. As a result of efforts begun in December 2014 to re-establish diplomatic relations with the Cuban Government, which were severed in January 1961, the US and Cuba reopened embassies in their respective countries in July 2015. The embargo remains in place, and the relationship between the US and Cuba remains tense.Illicit migration of Cuban nationals to the US via maritime and overland routes has been a longstanding challenge. On 12 January 2017, the US and Cuba signed a Joint Statement ending the so-called "wet-foot, dry-foot" policy  by which Cuban nationals who reached US soil were permitted to stay. Illicit Cuban migration by sea has since dropped significantly, but land border crossings continue. In FY 2018, the US Coast Guard interdicted 312 Cuban nationals at sea. Also in FY 2018, 7,249 Cuban migrants presented themselves at various land border ports of entry throughout the US.',
        region: "Central America & The Caribbean",
        capital: "Havana",
        "birth rate": 10.4,
        "death rate": 9.1,
        "population growth": -0.25,
        "labor force": 4691000,
        population: 11059062,
        "median age": 42.1,
        "GDP(PPP)": 137000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CU-flag.gif"
    },
    {
        id: "CW",
        name: "Curacao",
        background: "The original Arawak Indian settlers who arrived on the island from South America in about 1000, were largely enslaved by the Spanish early in the 16th century and forcibly relocated to other colonies where labor was needed. Curacao was seized by the Dutch from the Spanish in 1634. Once the center of the Caribbean slave trade, Curacao was hard hit economically by the abolition of slavery in 1863. Its prosperity (and that of neighboring Aruba) was restored in the early 20th century with the construction of the Isla Refineria to service the newly discovered Venezuelan oil fields. In 1954, Curacao and several other Dutch Caribbean possessions were reorganized as the Netherlands Antilles, part of the Kingdom of the Netherlands. In referenda in 2005 and 2009, the citizens of Curacao voted to become a self-governing country within the Kingdom of the Netherlands. The change in status became effective in October 2010 with the dissolution of the Netherlands Antilles.",
        region: "Central America & The Caribbean",
        capital: "Willemstad",
        "birth rate": 13.4,
        "death rate": 8.7,
        "population growth": 0.35,
        "labor force": 73010,
        population: 151345,
        "median age": 36.7,
        "GDP(PPP)": 3128000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/UC-flag.gif"
    },
    {
        id: "CY",
        name: "Cyprus",
        background: 'A former British colony, Cyprus became independent in 1960 following years of resistance to British rule. Tensions between the Greek Cypriot majority and Turkish Cypriot minority communities came to a head in December 1963, when violence broke out in the capital of Nicosia. Despite the deployment of UN peacekeepers in 1964, sporadic intercommunal violence continued, forcing most Turkish Cypriots into enclaves throughout the island. In 1974, a Greek Government-sponsored attempt to overthrow the elected president of Cyprus was met by military intervention from Turkey, which soon controlled more than a third of the island. In 1983, the Turkish Cypriot administered area declared itself the "Turkish Republic of Northern Cyprus" ("TRNC"), but it is recognized only by Turkey. An UN-mediated agreement, the Annan Plan, failed to win approval by both communities in 2004. In February 2014, after a hiatus of nearly two years, the leaders of the two communities resumed formal discussions under UN auspices aimed at reuniting the divided island. The most recent round of negotiations to reunify the island were suspended inJuly 2017 after failure to achieve a breakthrough. The entire island entered the EU on 1 May 2004, although the EU acquis - the body of common rights and obligations - applies only to the areas under the internationally recognized government, and is suspended in the "TRNC." However, individual Turkish Cypriots able to document their eligibility for Republic of Cyprus citizenship legally enjoy the same rights accorded to other citizens of EU states.',
        region: "Middle East",
        capital: "Nicosia",
        "birth rate": 10.9,
        "death rate": 7,
        "population growth": 1.15,
        "labor force": 426600,
        population: 1266676,
        "median age": 37.9,
        "GDP(PPP)": 31780000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CY-flag.gif"
    },
    {
        id: "CZ",
        name: "Czechia",
        background: 'At the close of World War I, the Czechs and Slovaks of the former Austro-Hungarian Empire merged to form Czechoslovakia. During the interwar years, having rejected a federal system, the new country\'s predominantly Czech leaders were frequently preoccupied with meeting the increasingly strident demands of other ethnic minorities within the republic, most notably the Slovaks, the Sudeten Germans, and the Ruthenians (Ukrainians). On the eve of World War II, Nazi Germany occupied the territory that today comprises Czechia, and Slovakia became an independent state allied with Germany. After the war, a reunited but truncated Czechoslovakia (less Ruthenia) fell within the Soviet sphere of influence. In 1968, an invasion by Warsaw Pact troops ended the efforts of the country\'s leaders to liberalize communist rule and create "socialism with a human face," ushering in a period of repression known as "normalization." The peaceful "Velvet Revolution" swept the Communist Party from power at the end of 1989 and inaugurated a return to democratic rule and a market economy. On 1 January 1993, the country underwent a nonviolent "velvet divorce" into its two national components, the Czech Republic and Slovakia. The Czech Republic joined NATO in 1999 and the European Union in 2004. The country added the short-form name Czechia in 2016, while continuing to use the full form name, Czech Republic.',
        region: "Europe",
        capital: "Prague",
        "birth rate": 8.9,
        "death rate": 10.7,
        "population growth": 0.06,
        "labor force": 5427000,
        population: 10702498,
        "median age": 43.3,
        "GDP(PPP)": 375900000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/EZ-flag.gif"
    },
    {
        id: "DK",
        name: "Denmark",
        background: "Once the seat of Viking raiders and later a major north European power, Denmark has evolved into a modern, prosperous nation that is participating in the general political and economic integration of Europe. It joined NATO in 1949 and the EEC (now the EU) in 1973. However, the country has opted out of certain elements of the EU's Maastricht Treaty, including the European Economic and Monetary Union, European defense cooperation, and issues concerning certain justice and home affairs.",
        region: "Europe",
        capital: "Copenhagen",
        "birth rate": 11.1,
        "death rate": 9.5,
        "population growth": 0.48,
        "labor force": 2998000,
        population: 5869410,
        "median age": 42,
        "GDP(PPP)": 287800000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/DA-flag.gif"
    },
    {
        id: "DJ",
        name: "Djibouti",
        background: "The French Territory of the Afars and the Issas became Djibouti in 1977. Hassan Gouled APTIDON installed an authoritarian one-party state and proceeded to serve as president until 1999. Unrest among the Afar minority during the 1990s led to a civil war that ended in 2001 with a peace accord between Afar rebels and the Somali Issa-dominated government. In 1999, Djibouti's first multiparty presidential election resulted in the election of Ismail Omar GUELLEH as president; he was reelected to a second term in 2005 and extended his tenure in office via a constitutional amendment, which allowed him to serve a third term in 2011 and begin a fourth term in 2016. Djibouti occupies a strategic geographic location at the intersection of the Red Sea and the Gulf of Aden. Its ports handle 95% of Ethiopias trade. Djiboutis ports also service transshipments between Europe, the Middle East, and Asia. The government holds longstanding ties to France, which maintains a military presence in the country, as does the US, Japan, Italy, Germany, Spain, and China.",
        region: "Africa",
        capital: "Djibouti",
        "birth rate": 22.7,
        "death rate": 7.3,
        "population growth": 2.07,
        "labor force": 294600,
        population: 921804,
        "median age": 24.9,
        "GDP(PPP)": 3640000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/DJ-flag.gif"
    },
    {
        id: "DM",
        name: "Dominica",
        background: "Dominica was the last of the Caribbean islands to be colonized by Europeans due chiefly to the fierce resistance of the native Caribs. France ceded possession to Great Britain in 1763, which colonized the island in 1805. Slavery ended in 1833 and in 1835 the first three men of African descent were elected to the legislative assembly of Dominica. In 1871, Dominica became part first of the British Leeward Islands and then the British Windward Islands until 1958. In 1967 Dominica became an associated state of the UK, and formally took responsibility for its internal affairs. In 1980, two years after independence, Dominica's fortunes improved when a corrupt and tyrannical administration was replaced by that of Mary Eugenia CHARLES, the first female prime minister in the Caribbean, who remained in office for 15 years. On 18 September 2017, Hurricane Maria passed over the island causing extensive damage to structures, roads, communications, and the power supply, and largely destroying critical agricultural areas.",
        region: "Central America & The Caribbean",
        capital: "Roseau",
        "birth rate": 14.5,
        "death rate": 8,
        "population growth": 0.13,
        "labor force": 25000,
        population: 74243,
        "median age": 34.9,
        "GDP(PPP)": 783000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/DO-flag.gif"
    },
    {
        id: "DO",
        name: "Dominican Republic",
        background: "The Taino - indigenous inhabitants of Hispaniola prior to the arrival of the Europeans - divided the island into five chiefdoms and territories. Christopher COLUMBUS explored and claimed the island on his first voyage in 1492; it became a springboard for Spanish conquest of the Caribbean and the American mainland. In 1697, Spain recognized French dominion over the western third of the island, which in 1804 became Haiti. The remainder of the island, by then known as Santo Domingo, sought to gain its own independence in 1821 but was conquered and ruled by the Haitians for 22 years; it finally attained independence as the Dominican Republic in 1844. In 1861, the Dominicans voluntarily returned to the Spanish Empire, but two years later they launched a war that restored independence in 1865. A legacy of unsettled, mostly non-representative rule followed, capped by the dictatorship of Rafael Leonidas TRUJILLO from 1930 to 1961. Juan BOSCH was elected president in 1962 but was deposed in a military coup in 1963. In 1965, the US led an intervention in the midst of a civil war sparked by an uprising to restore BOSCH. In 1966, Joaquin BALAGUER defeated BOSCH in the presidential election. BALAGUER maintained a tight grip on power for most of the next 30 years when international reaction to flawed elections forced him to curtail his term in 1996. Since then, regular competitive elections have been held in which opposition candidates have won the presidency. Former President Leonel FERNANDEZ Reyna (first term 1996-2000) won election to a new term in 2004 following a constitutional amendment allowing presidents to serve more than one term, and was later reelected to a second consecutive term. In 2012, Danilo MEDINA Sanchez became president; he was reelected in 2016.",
        region: "Central America & The Caribbean",
        capital: "Santo Domingo",
        "birth rate": 18.5,
        "death rate": 6.3,
        "population growth": 0.95,
        "labor force": 4732000,
        population: 10499707,
        "median age": 27.9,
        "GDP(PPP)": 173000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/DR-flag.gif"
    },
    {
        id: "EC",
        name: "Ecuador",
        background: "What is now Ecuador formed part of the northern Inca Empire until the Spanish conquest in 1533. Quito became a seat of Spanish colonial government in 1563 and part of the Viceroyalty of New Granada in 1717. The territories of the Viceroyalty - New Granada (Colombia), Venezuela, and Quito - gained their independence between 1819 and 1822 and formed a federation known as Gran Colombia. When Quito withdrew in 1830, the traditional name was changed in favor of the \"Republic of the Equator.\" Between 1904 and 1942, Ecuador lost territories in a series of conflicts with its neighbors. A border war with Peru that flared in 1995 was resolved in 1999. Although Ecuador marked 30 years of civilian governance in 2004, the period was marred by political instability. Protests in Quito contributed to the mid-term ouster of three of Ecuador's last four democratically elected presidents. In late 2008, voters approved a new constitution, Ecuador's 20th since gaining independence. General elections were held in April 2017, and voters elected President Lenin MORENO.",
        region: "South America",
        capital: "Quito",
        "birth rate": 17,
        "death rate": 5.2,
        "population growth": 1.2,
        "labor force": 8086000,
        population: 16904867,
        "median age": 28.8,
        "GDP(PPP)": 193000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/EC-flag.gif"
    },
    {
        id: "EG",
        name: "Egypt",
        background: "The regularity and richness of the annual Nile River flood, coupled with semi-isolation provided by deserts to the east and west, allowed for the development of one of the world's great civilizations. A unified kingdom arose circa 3200 B.C., and a series of dynasties ruled in Egypt for the next three millennia. The last native dynasty fell to the Persians in 341 B.C., who in turn were replaced by the Greeks, Romans, and Byzantines. It was the Arabs who introduced Islam and the Arabic language in the 7th century and who ruled for the next six centuries. A local military caste, the Mamluks took control about 1250 and continued to govern after the conquest of Egypt by the Ottoman Turks in 1517. Completion of the Suez Canal in 1869 elevated Egypt as an important world transportation hub. Ostensibly to protect its investments, Britain seized control of Egypt's government in 1882, but nominal allegiance to the Ottoman Empire continued until 1914. Partially independent from the UK in 1922, Egypt acquired full sovereignty from Britain in 1952. The completion of the Aswan High Dam in 1971 and the resultant Lake Nasser have reaffirmed the time-honored place of the Nile River in the agriculture and ecology of Egypt. A rapidly growing population (the largest in the Arab world), limited arable land, and dependence on the Nile all continue to overtax resources and stress society. The government has struggled to meet the demands of Egypt's fast-growing population as it implements far-reaching economic reforms, including the reduction of select subsidies, large-scale infrastructure projects, energy cooperation, and foreign direct investment appeals.Inspired by the 2010 Tunisian revolution, Egyptian opposition groups led demonstrations and labor strikes countrywide, culminating in President Hosni MUBARAK's ouster in 2011. Egypt's military assumed national leadership until a new legislature was in place in early 2012; later that same year, Muhammad MURSI won the presidential election. Following protests throughout the spring of 2013 against MURSI's government and the Muslim Brotherhood, the Egyptian Armed Forces intervened and removed MURSI from power in July 2013 and replaced him with interim president Adly MANSOUR. Simultaneously, the government began enacting laws to limit freedoms of assembly and expression. In January 2014, voters approved a new constitution by referendum and in May 2014 elected former defense minister Abdelfattah ELSISI president. Egypt elected a new legislature in December 2015,its first Hose of Representatives since 2012. ELSISI was reelected to a second four-year term in March 2018. In April 2019, Egypt approved via national referendum a set of constitutional amendments extending ELSISIs term in office through 2024 and possibly through 2030 if re-elected for a third term. The amendments would also allow future presidents up to two consecutive six-year terms in office, re-establish an upper legislative house, allow for one or more vice presidents, establish a 25% quota for female legislators, reaffirm the militarys role as guardian of Egypt, and expand presidential authority to appoint the heads of judicial councils.",
        region: "Africa",
        capital: "Cairo",
        "birth rate": 27.2,
        "death rate": 4.4,
        "population growth": 2.28,
        "labor force": 29950000,
        population: 104124440,
        "median age": 24.1,
        "GDP(PPP)": 1204000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/EG-flag.gif"
    },
    {
        id: "SV",
        name: "El Salvador",
        background: "El Salvador achieved independence from Spain in 1821 and from the Central American Federation in 1839. A 12-year civil war, which cost about 75,000 lives, was brought to a close in 1992 when the government and leftist rebels signed a treaty that provided for military and political reforms. El Salvador is beset by one of the world's highest homicide rates and pervasive criminal gangs.",
        region: "Central America & The Caribbean",
        capital: "San Salvador",
        "birth rate": 18.6,
        "death rate": 5.9,
        "population growth": 0.83,
        "labor force": 2774000,
        population: 6481102,
        "median age": 27.7,
        "GDP(PPP)": 51170000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/ES-flag.gif"
    },
    {
        id: "GQ",
        name: "Equatorial Guinea",
        background: "Equatorial Guinea gained independence in 1968 after 190 years of Spanish rule; it is one of the smallest countries in Africa consisting of a mainland territory and five inhabited islands. The capital of Malabo is located on the island of Bioko, approximately 25 km from the Cameroonian coastline in the Gulf of Guinea. Between 1968 and 1979, autocratic President Francisco MACIAS NGUEMA virtually destroyed all of the country's political, economic, and social institutions before being deposed by his nephew Teodoro OBIANG NGUEMA MBASOGO in a coup. President OBIANG has ruled since October 1979. He has been elected several times since 1996, and was most recently reelected in 2016. Although nominally a constitutional democracy since 1991, presidential and legislative elections since 1996 have generally been labeled as flawed. The president exerts almost total control over the political system and has placed legal and bureaucratic barriers that hinder political opposition. Equatorial Guinea experienced rapid economic growth in the early years of the 21st century due to the discovery of large offshore oil reserves in 1996. Production peaked in late 2004 and has slowly declined since, although aggressive searches for new oil fields continue. Despite the country's economic windfall from oil production, resulting in massive increases in government revenue in past years, the drop in global oil prices as of 2014 has placed significant strain on the state budget and pushed the country into recession. Oil revenues have mainly been used for the development of infrastructure and there have been limited improvements in the population's living standards. Equatorial Guinea continues to seek to diversify its economy and to increase foreign investment. The country hosts major regional and international conferences and continues to seek a greater role in international affairs, and leadership in the sub-region.",
        region: "Africa",
        capital: "Malabo",
        "birth rate": 30.7,
        "death rate": 7.3,
        "population growth": 2.35,
        "labor force": 195200,
        population: 836178,
        "median age": 20.3,
        "GDP(PPP)": 31520000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/EK-flag.gif"
    },
    {
        id: "ER",
        name: "Eritrea",
        background: "After independence from Italian colonial control in 1941 and 10 years of British administrative control, the UN established Eritrea as an autonomous region within the Ethiopian federation in 1952. Ethiopia's full annexation of Eritrea as a province 10 years later sparked a violent 30-year struggle for independence that ended in 1991 with Eritrean rebels defeating government forces. Eritreans overwhelmingly approved independence in a 1993 referendum. ISAIAS Afwerki has been Eritrea's only president since independence; his rule, particularly since 2001, has been highly autocratic and repressive. His government has created a highly militarized society by pursuing an unpopular program of mandatory conscription into national service  divided between military and civilian service  of indefinite length. A two-and-a-half-year border war with Ethiopia that erupted in 1998 ended under UN auspices in December 2000. A UN peacekeeping operation was established that monitored a 25 km-wide Temporary Security Zone. The Eritrea-Ethiopia Boundary Commission (EEBC) created in April 2003 was tasked \"to delimit and demarcate the colonial treaty border based on pertinent colonial treaties (1900, 1902, and 1908) and applicable international law.\" The EEBC on 30 November 2007 remotely demarcated the border, assigning the town of Badme to Eritrea, despite Ethiopia's maintaining forces there from the time of the 1998-2000 war. Eritrea insisted that the UN terminate its peacekeeping mission on 31 July 2008. More than a decade of a tense no peace, no war stalemate ended in 2018 after the newly elected Ethiopian Prime Minister accepted the EEBCs 2007 ruling, and the two countries signed declarations of peace and friendship in July and September. Following the July 2018 peace agreement with Ethiopia, Eritrean leaders engaged in intensive diplomacy around the Horn of Africa, bolstering regional peace, security, and cooperation, as well as brokering rapprochements between governments and opposition groups. In November 2018, the UN Security Council lifted an arms embargo that had been imposed on Eritrea since 2009, after the UN Somalia-Eritrea Monitoring Group reported they had not found evidence of Eritrean support in recent years for Al-Shabaab.",
        region: "Africa",
        capital: "Asmara",
        "birth rate": 27.9,
        "death rate": 6.9,
        "population growth": 0.93,
        "labor force": 2710000,
        population: 6081196,
        "median age": 20.3,
        "GDP(PPP)": 9402000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/ER-flag.gif"
    },
    {
        id: "EE",
        name: "Estonia",
        background: "After centuries of Danish, Swedish, German, and Russian rule, Estonia attained independence in 1918. Forcibly incorporated into the USSR in 1940 - an action never recognized by the US and many other countries - it regained its freedom in 1991 with the collapse of the Soviet Union. Since the last Russian troops left in 1994, Estonia has been free to promote economic and political ties with the West. It joined both NATO and the EU in the spring of 2004, formally joined the OECD in late 2010, and adopted the euro as its official currency on 1 January 2011.",
        region: "Europe",
        capital: "Tallinn",
        "birth rate": 9.3,
        "death rate": 12.9,
        "population growth": -0.65,
        "labor force": 670200,
        population: 1228624,
        "median age": 43.7,
        "GDP(PPP)": 41650000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/EN-flag.gif"
    },
    {
        id: "SZ",
        name: "Eswatini",
        background: "Autonomy for Eswatini was guaranteed by the British in the late 19th century; independence was granted in 1968. A new constitution came into effect in 2006, which included provisions for a more independent parliament and judiciary, but the legal status of political parties remains unclear. King MSWATI III renamed the country from Swaziland to Eswatini in April 2018. Despite its classification as a lower-middle income country, Eswatini suffers from severe poverty and high unemployment. Eswatini has the world's highest HIV/AIDS prevalence rate, although recent years have shown marked declines in new infections.",
        region: "Africa",
        capital: "Mbabane",
        "birth rate": 24.5,
        "death rate": 10.1,
        "population growth": 0.77,
        "labor force": 427900,
        population: 1104479,
        "median age": 23.7,
        "GDP(PPP)": 11600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/WZ-flag.gif"
    },
    {
        id: "ET",
        name: "Ethiopia",
        background: "Unique among African countries, the ancient Ethiopian monarchy maintained its freedom from colonial rule with the exception of a short-lived Italian occupation from 1936-41. In 1974, a military junta, the Derg, deposed Emperor Haile SELASSIE (who had ruled since 1930) and established a socialist state. Torn by bloody coups, uprisings, wide-scale drought, and massive refugee problems, the regime was finally toppled in 1991 by a coalition of rebel forces, the Ethiopian People's Revolutionary Democratic Front (EPRDF). A constitution was adopted in 1994, and Ethiopia's first multiparty elections were held in 1995. A border war with Eritrea in the late 1990s ended with a peace treaty in December 2000. In November 2007, the Eritrea-Ethiopia Border Commission (EEBC) issued specific coordinates as virtually demarcating the border and pronounced its work finished. Alleging that the EEBC acted beyond its mandate in issuing the coordinates, Ethiopia did not accept them and maintained troops in previously contested areas pronounced by the EEBC as belonging to Eritrea. This intransigence resulted in years of heightened tension between the two countries. In August 2012, longtime leader Prime Minister MELES Zenawi died in office and was replaced by his Deputy Prime Minister HAILEMARIAM Desalegn, marking the first peaceful transition of power in decades. Following a wave of popular dissent and anti-government protest that began in 2015, HAILEMARIAM resigned in February 2018 and ABIY Ahmed Ali took office in April 2018 as Ethiopia's first ethnic Oromo prime minister. In June 2018, ABIY announced Ethiopia would accept the border ruling of 2000, prompting rapprochement between Ethiopia and Eritrea that was marked with a peace agreement in July 2018 and a reopening of the border in September 2018. In November 2019, Ethiopia's nearly 30-year ethnic-based ruling coalition - the EPRDF - merged into a single unity party called the Prosperity Party, however, one of the four constituent parties refused to join.",
        region: "Africa",
        capital: "AddisAbaba",
        "birth rate": 31.6,
        "death rate": 5.9,
        "population growth": 2.56,
        "labor force": 52820000,
        population: 108113150,
        "median age": 19.8,
        "GDP(PPP)": 200600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/ET-flag.gif"
    },
    {
        id: "FO",
        name: "Faroe Islands",
        background: "The population of the Faroe Islands is largely descended from Viking settlers who arrived in the 9th century. The islands have been connected politically to Denmark since the 14th century. A high degree of self-government was granted the Faroese in 1948, who have autonomy over most internal affairs while Denmark is responsible for justice, defense, and foreign affairs. The Faroe Islands are not part of the European Union.",
        region: "Europe",
        capital: "Torshavn",
        "birth rate": 14.9,
        "death rate": 8.8,
        "population growth": 0.6,
        "labor force": 27540,
        population: 51628,
        "median age": 37.2,
        "GDP(PPP)": 2001000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/FO-flag.gif"
    },
    {
        id: "FJ",
        name: "Fiji",
        background: 'Fiji became independent in 1970 after nearly a century as a British colony. Democratic rule was interrupted by two military coups in 1987 caused by concern over a government perceived as dominated by the Indian community (descendants of contract laborers brought to the islands by the British in the 19th century). The coups and a 1990 constitution that cemented native Melanesian control of Fiji led to heavy Indian emigration; the population loss resulted in economic difficulties, but ensured that Melanesians became the majority. A new constitution enacted in 1997 was more equitable. Free and peaceful elections in 1999 resulted in a government led by an Indo-Fijian, but a civilian-led coup in 2000 ushered in a prolonged period of political turmoil. Parliamentary elections held in 2001 provided Fiji with a democratically elected government led by Prime Minister Laisenia QARASE. Reelected in May 2006, QARASE was ousted in a December 2006 military coup led by Commodore Voreqe BAINIMARAMA, who initially appointed himself acting president but in January 2007 became interim prime minister. Following years of political turmoil, long-delayed legislative elections were held in September 2014 that were deemed "credible" by international observers and that resulted in BAINIMARAMA being reelected. He was reelected in November 2018 in elections deemed free and fair.',
        region: "Oceania",
        capital: "Suva",
        "birth rate": 17.4,
        "death rate": 6.3,
        "population growth": 0.5,
        "labor force": 353100,
        population: 935974,
        "median age": 29.9,
        "GDP(PPP)": 8629000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/FJ-flag.gif"
    },
    {
        id: "FI",
        name: "Finland",
        background: "Finland was a province and then a grand duchy under Sweden from the 12th to the 19th centuries, and an autonomous grand duchy of Russia after 1809. It gained complete independence in 1917. During World War II, Finland successfully defended its independence through cooperation with Germany and resisted subsequent invasions by the Soviet Union - albeit with some loss of territory. In the subsequent half century, Finland transformed from a farm/forest economy to a diversified modern industrial economy; per capita income is among the highest in Western Europe. A member of the EU since 1995, Finland was the only Nordic state to join the euro single currency at its initiation in January 1999. In the 21st century, the key features of Finland's modern welfare state are high quality education, promotion of equality, and a national social welfare system - currently challenged by an aging population and the fluctuations of an export-driven economy.",
        region: "Europe",
        capital: "Helsinki",
        "birth rate": 10.6,
        "death rate": 10.3,
        "population growth": 0.3,
        "labor force": 2473000,
        population: 5571665,
        "median age": 42.8,
        "GDP(PPP)": 244900000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/FI-flag.gif"
    },
    {
        id: "FR",
        name: "France",
        background: "France today is one of the most modern countries in the world and is a leader among European nations. It plays an influential global role as a permanent member of the United Nations Security Council, NATO, the G-7, the G-20, the EU, and other multilateral organizations. France rejoined NATO's integrated military command structure in 2009, reversing DE GAULLE's 1966 decision to withdraw French forces from NATO. Since 1958, it has constructed a hybrid presidential-parliamentary governing system resistant to the instabilities experienced in earlier, more purely parliamentary administrations. In recent decades, its reconciliation and cooperation with Germany have proved central to the economic integration of Europe, including the introduction of a common currency, the euro, in January 1999. In the early 21st century, five French overseas entities - French Guiana, Guadeloupe, Martinique, Mayotte, and Reunion - became French regions and were made part of France proper.",
        region: "Europe",
        capital: "Paris",
        "birth rate": 11.9,
        "death rate": 9.6,
        "population growth": 0.35,
        "labor force": 30680000,
        population: 67848156,
        "median age": 41.7,
        "GDP(PPP)": 2856000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/FR-flag.gif"
    },
    {
        id: "PF",
        name: "French Polynesia",
        background: "The French annexed various Polynesian island groups during the 19th century. In 1966, the French Government began testing nuclear weapons on the uninhabited Mururoa Atoll; following mounting opposition, the tests were moved underground in 1975. In September 1995, France stirred up widespread protests by resuming nuclear testing after a three-year moratorium. The tests were halted in January 1996. In recent years, French Polynesia's autonomy has been considerably expanded.",
        region: "Oceania",
        capital: "Papeete",
        "birth rate": 14,
        "death rate": 5.5,
        "population growth": 0.79,
        "labor force": 126300,
        population: 295121,
        "median age": 33.3,
        "GDP(PPP)": 5490000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/FP-flag.gif"
    },
    {
        id: "GA",
        name: "Gabon",
        background: "Following, independence from France in 1960, El Hadj Omar BONGO Ondimba - one of the longest-ruling heads of state in the world - dominated the country's political scene for four decades (1967-2009). President BONGO introduced a nominal multiparty system and a new constitution in the early 1990s. However, allegations of electoral fraud during local elections in December 2002 and the presidential election in 2005 exposed the weaknesses of formal political structures in Gabon. Following President BONGO's death in 2009, a new election brought his son, Ali BONGO Ondimba, to power. Despite constrained political conditions, Gabon's small population, abundant natural resources, and considerable foreign support have helped make it one of the more stable African countries.President Ali BONGO Ondimbas controversial August 2016 reelection sparked unprecedented opposition protests that resulted in the burning of the parliament building. The election was contested by the opposition after fraudulent results were flagged by international election observers. Gabons Constitutional Court reviewed the election results but ruled in favor of President BONGO, upholding his win and extending his mandate to 2023.",
        region: "Africa",
        capital: "Libreville",
        "birth rate": 26.3,
        "death rate": 5.9,
        "population growth": 2.5,
        "labor force": 557800,
        population: 2230908,
        "median age": 21,
        "GDP(PPP)": 36660000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GB-flag.gif"
    },
    {
        id: "GM",
        name: "Gambia",
        background: "The Gambia gained its independence from the UK in 1965. Geographically surrounded by Senegal, it formed a short-lived Confederation of Senegambia between 1982 and 1989. In 1991, the two nations signed a friendship and cooperation treaty, although tensions flared up intermittently during the regime of Yahya JAMMEH. JAMMEH led a military coup in 1994 that overthrew the president and banned political activity. A new constitution and presidential election in 1996, followed by parliamentary balloting in 1997, completed a nominal return to civilian rule. JAMMEH was elected president in all subsequent elections including most recently in late 2011. After 22 years of increasingly authoritarian rule, President JAMMEH was defeated in free and fair elections in December 2016. Due to The Gambias poor human rights record under JAMMEH, international development partners had distanced themselves, and substantially reduced aid to the country. These channels have now reopened under the administration of President Adama BARROW, who took office in January 2017. The US and The Gambia currently enjoy improved relations. US assistance to the country has supported military education and training programs, as well as various capacity building and democracy strengthening activities.",
        region: "Africa",
        capital: "Banjul",
        "birth rate": 27,
        "death rate": 6.7,
        "population growth": 1.87,
        "labor force": 777100,
        population: 2173999,
        "median age": 21.8,
        "GDP(PPP)": 5556000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GA-flag.gif"
    },
    {
        id: "GE",
        name: "Georgia",
        background: "The region of present day Georgia contained the ancient kingdoms of Colchis and Kartli-Iberia. The area came under Roman influence in the first centuries A.D., and Christianity became the state religion in the 330s. Domination by Persians, Arabs, and Turks was followed by a Georgian golden age (11th-13th centuries) that was cut short by the Mongol invasion of 1236. Subsequently, the Ottoman and Persian empires competed for influence in the region. Georgia was absorbed into the Russian Empire in the 19th century. Independent for three years (1918-1921) following the Russian revolution, it was forcibly incorporated into the USSR in 1921 and regained its independence when the Soviet Union dissolved in 1991.Mounting public discontent over rampant corruption and ineffective government services, followed by an attempt by the incumbent Georgian Government to manipulate parliamentary elections in November 2003, touched off widespread protests that led to the resignation of Eduard SHEVARDNADZE, president since 1995. In the aftermath of that popular movement, which became known as the \"Rose Revolution,\" new elections in early 2004 swept Mikheil SAAKASHVILI into power along with his United National Movement (UNM) party. Progress on market reforms and democratization has been made in the years since independence, but this progress has been complicated by Russian assistance and support to the separatist regions of Abkhazia and South Ossetia. Periodic flare-ups in tension and violence culminated in a five-day conflict in August 2008 between Russia and Georgia, including the invasion of large portions of undisputed Georgian territory. Russian troops pledged to pull back from most occupied Georgian territory, but in late August 2008 Russia unilaterally recognized the independence of Abkhazia and South Ossetia, and Russian military forces remain in those regions.Billionaire Bidzina IVANISHVILI's unexpected entry into politics in October 2011 brought the divided opposition together under his Georgian Dream coalition, which won a majority of seats in the October 2012 parliamentary elections and removed UNM from power. Conceding defeat, SAAKASHVILI named IVANISHVILI as prime minister and allowed Georgian Dream to create a new government. Giorgi MARGVELASHVILI was inaugurated as president on 17 November 2013, ending a tense year of power-sharing between SAAKASHVILI and IVANISHVILI. At the time, these changes in leadership represented unique examples of a former Soviet state that emerged to conduct democratic and peaceful government transitions of power. IVANISHVILI voluntarily resigned from office after the presidential succession, and Georgia's legislature on 20 November 2013 confirmed Irakli GARIBASHVILI as his replacement. GARIBASHVILI was replaced by Giorgi KVIRIKASHVILI in December 2015. KVIRIKASHVILI remained prime minister following Georgian Dreams success in the October 2016 parliamentary elections, where the party won a constitutional majority. IVANISHVILI reemerged as Georgian Dream party chairman in April 2018. KVIRIKASHVILI resigned in June 2018 and was replaced by Mamuka BAKHTADZE. In September 2019, BAKHTADZE resigned and Giorgi GAKHARIA was named the country's new head of government, Georgia's fifth prime minister in seven years. Popular and government support for integration with the West is high in Georgia. Joining the EU and NATO are among the country's top foreign policy goals.",
        region: "Asia",
        capital: "Tbilisi",
        "birth rate": 11.6,
        "death rate": 11,
        "population growth": 0.05,
        "labor force": 1998000,
        population: 3997000,
        "median age": 38.6,
        "GDP(PPP)": 39850000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GG-flag.gif"
    },
    {
        id: "DE",
        name: "Germany",
        background: "As Europe's largest economy and second most populous nation (after Russia), Germany is a key member of the continent's economic, political, and defense organizations. European power struggles immersed Germany in two devastating world wars in the first half of the 20th century and left the country occupied by the victorious Allied powers of the US, UK, France, and the Soviet Union in 1945. With the advent of the Cold War, two German states were formed in 1949: the western Federal Republic of Germany (FRG) and the eastern German Democratic Republic (GDR). The democratic FRG embedded itself in key western economic and security organizations, the EC (now the EU) and NATO, while the communist GDR was on the front line of the Soviet-led Warsaw Pact. The decline of the USSR and the end of the Cold War allowed for German reunification in 1990. Since then, Germany has expended considerable funds to bring eastern productivity and wages up to western standards. In January 1999, Germany and 10 other EU countries introduced a common European exchange currency, the euro.",
        region: "Europe",
        capital: "Berlin",
        "birth rate": 8.6,
        "death rate": 12.1,
        "population growth": -0.19,
        "labor force": 45900000,
        population: 80159662,
        "median age": 47.8,
        "GDP(PPP)": 4199000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GM-flag.gif"
    },
    {
        id: "GH",
        name: "Ghana",
        background: "Formed from the merger of the British colony of the Gold Coast and the Togoland trust territory, Ghana in 1957 became the first Sub-Saharan country in colonial Africa to gain its independence. Ghana endured a series of coups before Lt. Jerry RAWLINGS took power in 1981 and banned political parties. After approving a new constitution and restoring multiparty politics in 1992, RAWLINGS won presidential elections in 1992 and 1996 but was constitutionally prevented from running for a third term in 2000. John KUFUOR of the opposition New Patriotic Party (NPP) succeeded him and was reelected in 2004. John Atta MILLS of the National Democratic Congress won the 2008 presidential election and took over as head of state. MILLS died in July 2012 and was constitutionally succeeded by his vice president, John Dramani MAHAMA, who subsequently won the December 2012 presidential election. In 2016, Nana Addo Dankwa AKUFO-ADDO of the NPP defeated MAHAMA, marking the third time that Ghanas presidency has changed parties since the return to democracy.",
        region: "Africa",
        capital: "Accra",
        "birth rate": 29.6,
        "death rate": 6.6,
        "population growth": 2.15,
        "labor force": 12490000,
        population: 29340248,
        "median age": 21.4,
        "GDP(PPP)": 134000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GH-flag.gif"
    },
    {
        id: "GI",
        name: "Gibraltar",
        background: "Strategically important, Gibraltar was reluctantly ceded to Great Britain by Spain in the 1713 Treaty of Utrecht; the British garrison was formally declared a colony in 1830. In a referendum held in 1967, Gibraltarians voted overwhelmingly to remain a British dependency. The subsequent granting of autonomy in 1969 by the UK led Spain to close the border and sever all communication links. Between 1997 and 2002, the UK and Spain held a series of talks on establishing temporary joint sovereignty over Gibraltar. In response to these talks, the Gibraltar Government called a referendum in late 2002 in which the majority of citizens voted overwhelmingly against any sharing of sovereignty with Spain. Since late 2004, Spain, the UK, and Gibraltar have held tripartite talks with the aim of cooperatively resolving problems that affect the local population, and work continues on cooperation agreements in areas such as taxation and financial services; communications and maritime security; policy, legal and customs services; environmental protection; and education and visa services. A new noncolonial constitution came into force in 2007, and the European Court of First Instance recognized Gibraltar's right to regulate its own tax regime in December 2008. The UK retains responsibility for defense, foreign relations, internal security, and financial stability.Spain and the UK continue to spar over the territory. Throughout 2009, a dispute over Gibraltar's claim to territorial waters extending out three miles gave rise to periodic non-violent maritime confrontations between Spanish and UK naval patrols and in 2013, the British reported a record number of entries by Spanish vessels into waters claimed by Gibraltar following a dispute over Gibraltar's creation of an artificial reef in those waters. Spain renewed its demands for an eventual return of Gibraltar to Spanish control after the UKs June 2016 vote to leave the EU, but London has dismissed any connection between the vote and its continued sovereignty over Gibraltar. The EU has said that Gibraltar will be ouside the territorial scope of any future UK-EU trade deal and that separate agreements between the EU and UK regarding Gibraltar would require Spain's prior approval.",
        region: "Europe",
        capital: "Gibraltar",
        "birth rate": 13.8,
        "death rate": 8.6,
        "population growth": 0.2,
        "labor force": 24420,
        population: 29581,
        "median age": 35.5,
        "GDP(PPP)": 2044000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GI-flag.gif"
    },
    {
        id: "GR",
        name: "Greece",
        background: "Greece achieved independence from the Ottoman Empire in 1830. During the second half of the 19th century and the first half of the 20th century, it gradually added neighboring islands and territories, most with Greek-speaking populations. In World War II, Greece was first invaded by Italy (1940) and subsequently occupied by Germany (1941-44); fighting endured in a protracted civil war between supporters of the king and other anti-communist and communist rebels. Following the latter's defeat in 1949, Greece joined NATO in 1952. In 1967, a group of military officers seized power, establishing a military dictatorship that suspended many political liberties and forced the king to flee the country. In 1974 following the collapse of the dictatorship, democratic elections and a referendum created a parliamentary republic and abolished the monarchy. In 1981, Greece joined the EC (now the EU); it became the 12th member of the European Economic and Monetary Union (EMU) in 2001. Greece has suffered a severe economic crisis since late 2009, due to nearly a decade of chronic overspending and structural rigidities.Beginning in2010, Greece entered three bailout agreements - with the European Commission, the European Central Bank (ECB), the IMF, andthe third in 2015 withthe European Stability Mechanism (ESM) - worth in total about $300 billion. The Greek Government formally exited the third bailout in August 2018.",
        region: "Europe",
        capital: "Athens",
        "birth rate": 7.8,
        "death rate": 12,
        "population growth": -0.31,
        "labor force": 4769000,
        population: 10607051,
        "median age": 45.3,
        "GDP(PPP)": 299300000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GR-flag.gif"
    },
    {
        id: "GL",
        name: "Greenland",
        background: "Greenland, the world's largest island, is about 80% ice-capped. Vikings reached the island in the 10th century from Iceland; Danish colonization began in the 18th century, and Greenland became an integral part of the Danish Realm in 1953. It joined the European Community (now the EU) with Denmark in 1973 but withdrew in 1985 over a dispute centered on stringent fishing quotas. Greenland remains a member of the Overseas Countries and Territories Association of the EU. Greenland was granted self-government in 1979 by the Danish parliament; the law went into effect the following year. Greenland voted in favor of increased self-rule in November 2008 and acquired greater responsibility for internal affairs when the Act on Greenland Self-Government was signed into law in June 2009. Denmark, however, continues to exercise control over several policy areas on behalf of Greenland, including foreign affairs, security, and financial policy in consultation with Greenland's Self-Rule Government.",
        region: "North America",
        capital: "Nuuk",
        "birth rate": 14.1,
        "death rate": 9,
        "population growth": -0.08,
        "labor force": 26840,
        population: 57616,
        "median age": 34.3,
        "GDP(PPP)": 2413000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GL-flag.gif"
    },
    {
        id: "GD",
        name: "Grenada",
        background: "Carib Indians inhabited Grenada when Christopher COLUMBUS discovered the island in 1498, but it remained uncolonized for more than a century. The French settled Grenada in the 17th century, established sugar estates, and imported large numbers of African slaves. Britain took the island in 1762 and vigorously expanded sugar production. In the 19th century, cacao eventually surpassed sugar as the main export crop; in the 20th century, nutmeg became the leading export. In 1967, Britain gave Grenada autonomy over its internal affairs. Full independence was attained in 1974 making Grenada one of the smallest independent countries in the Western Hemisphere. In 1979, a leftist New Jewel Movement seized power under Maurice BISHOP ushering in the Grenada Revolution. On 19 October 1983, factions within the revolutionary government overthrew and killed BISHOP and members of his party. Six days later the island was invaded by US forces and those of six other Caribbean nations, which quickly captured the ringleaders and their hundreds of Cuban advisers. The rule of law was restored and democratic elections were reinstituted the following year and have continued since then.",
        region: "Central America & The Caribbean",
        capital: "Saint George's",
        "birth rate": 14.6,
        "death rate": 8.3,
        "population growth": 0.38,
        "labor force": 55270,
        population: 113094,
        "median age": 33.3,
        "GDP(PPP)": 1634000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GJ-flag.gif"
    },
    {
        id: "GU",
        name: "Guam",
        background: "Spain ceded Guam to the US in 1898. Captured by the Japanese in 1941, it was retaken by the US three years later. The military installations on the island are some of the most strategically important US bases in the Pacific; they also constitute the islands most important source of income and economic stability.",
        region: "Oceania",
        capital: "Hagatna",
        "birth rate": 18.9,
        "death rate": 6,
        "population growth": 0.2,
        "labor force": 73210,
        population: 168485,
        "median age": 29.4,
        "GDP(PPP)": 5793000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GQ-flag.gif"
    },
    {
        id: "GT",
        name: "Guatemala",
        background: "The Maya civilization flourished in Guatemala and surrounding regions during the first millennium A.D. After almost three centuries as a Spanish colony, Guatemala won its independence in 1821. During the second half of the 20th century, it experienced a variety of military and civilian governments, as well as a 36-year guerrilla war. In 1996, the government signed a peace agreement formally ending the internal conflict.",
        region: "Central America & The Caribbean",
        capital: "Guatemala City",
        "birth rate": 23.3,
        "death rate": 4.9,
        "population growth": 1.68,
        "labor force": 6664000,
        population: 17153288,
        "median age": 23.2,
        "GDP(PPP)": 138100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GT-flag.gif"
    },
    {
        id: "GG",
        name: "Guernsey",
        background: "Guernsey and the other Channel Islands represent the last remnants of the medieval Duchy of Normandy, which held sway in both France and England. The islands were the only British soil occupied by German troops in World War II. The Bailiwick of Guernsey is a self-governing British Crown dependency that is not part of the United Kingdom. However, the UK Government is constitutionally responsible for its defense and international representation. The Bailiwick of Guernsey consists of the main island of Guernsey and a number of smaller islands including Alderney, Sark, Herm, Jethou, Brecqhou, and Lihou.",
        region: "Europe",
        capital: "Saint Peter Port",
        "birth rate": 9.8,
        "death rate": 9.2,
        "population growth": 0.26,
        "labor force": 31470,
        population: 67052,
        "median age": 44.3,
        "GDP(PPP)": 3465000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GK-flag.gif"
    },
    {
        id: "GN",
        name: "Guinea",
        background: "Guinea is at a turning point after decades of authoritarian rule since gaining its independence from France in 1958. Sekou TOURE ruled the country as president from independence to his death in 1984. Lansana CONTE came to power in 1984 when the military seized the government after TOURE's death. Gen. CONTE organized and won presidential elections in 1993, 1998, and 2003, though results were questionable due to a lack in transparency and neutrality in the electoral process. Upon CONTE's death in December 2008, Capt. Moussa Dadis CAMARA led a military coup, seizing power and suspending the constitution. His unwillingness to yield to domestic and international pressure to step down led to heightened political tensions that peaked in September 2009 when presidential guards opened fire on an opposition rally killing more than 150 people. In early December 2009, CAMARA was wounded in an assassination attempt and exiled to Burkina Faso. A transitional government led by Gen. Sekouba KONATE paved the way for Guinea's transition to a fledgling democracy. The country held its first free and competitive democratic presidential and legislative elections in 2010 and 2013 respectively, and in October 2015 held a second consecutive presidential election. Alpha CONDE was reelected to a second five-year term as president in 2015, and the National Assembly was seated in January 2014. CONDE's first cabinet is the first all-civilian government in Guinea. The country held a successful political dialogue in August and September 2016 that brought together the government and opposition to address long-standing tensions. Local elections were held in February 2018, and disputed results in some of the races resulted in ongoing protests against CONDE's government.",
        region: "Africa",
        capital: "Conakry",
        "birth rate": 36.1,
        "death rate": 8.4,
        "population growth": 2.76,
        "labor force": 5558000,
        population: 12527440,
        "median age": 19.1,
        "GDP(PPP)": 27970000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GV-flag.gif"
    },
    {
        id: "GW",
        name: "Guinea-Bissau",
        background: "Since independence from Portugal in 1974, Guinea-Bissau has experienced considerable political and military upheaval. In 1980, a military coup established authoritarian General Joao Bernardo 'Nino' VIEIRA as president. Despite eventually setting a path to a market economy and multiparty system, VIEIRA's regime was characterized by the suppression of political opposition and the purging of political rivals. Several coup attempts through the 1980s and early 1990s failed to unseat him. In 1994 VIEIRA was elected president in the country's first free, multiparty election. A military mutiny and resulting civil war in 1998 eventually led to VIEIRA's ouster in May 1999. In February 2000, a transitional government turned over power to opposition leader Kumba YALA after he was elected president in transparent polling. In September 2003, after only three years in office, YALA was overthrown in a bloodless military coup, and businessman Henrique ROSA was sworn in as interim president. In 2005, former President VIEIRA was reelected, pledging to pursue economic development and national reconciliation; he was assassinated in March 2009. Malam Bacai SANHA was elected in an emergency election held in June 2009, but he passed away in January 2012 from a long-term illness. A military coup in April 2012 prevented Guinea-Bissau's second-round presidential election - to determine SANHA's successor - from taking place. Following mediation by the Economic Community of Western African States, a civilian transitional government assumed power in 2012 and remained until Jose Mario VAZ won a free and fair election in 2014. Beginning in 2015, a political dispute between factions in the ruling PAIGC party brought government gridlock. It was not until April 2018 that a consensus prime minister could be appointed, the national legislature reopened (having been closed for two years), and a new government formed under Prime Minister Aristides GOMES. In March 2019, the government held legislative elections, voting in the PAIGC as the ruling party; however, President VAZ continues to perpetuate a political stalemate by refusing to name PAICG President Domingos SIMOES PEREIRA Prime Minister.",
        region: "Africa",
        capital: "Bissau",
        "birth rate": 36.9,
        "death rate": 7.9,
        "population growth": 2.51,
        "labor force": 731300,
        population: 1927104,
        "median age": 18,
        "GDP(PPP)": 3171000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PU-flag.gif"
    },
    {
        id: "GY",
        name: "Guyana",
        background: "Originally a Dutch colony in the 17th century, by 1815 Guyana had become a British possession. The abolition of slavery led to settlement of urban areas by former slaves and the importation of indentured servants from India to work the sugar plantations. The resulting ethnocultural divide has persisted and has led to turbulent politics. Guyana achieved independence from the UK in 1966, and since then it has been ruled mostly by socialist-oriented governments. In 1992, Cheddi JAGAN was elected president in what is considered the country's first free and fair election since independence. After his death five years later, his wife, Janet JAGAN, became president but resigned in 1999 due to poor health. Her successor, Bharrat JAGDEO, was elected in 2001 and again in 2006. Early elections held in May 2015 resulted in the first change in governing party and the replacement of President Donald RAMOTAR by current President David GRANGER. After a December 2018 no-confidence vote against the GRANGER government, national elections will be held before the scheduled spring 2020 date.",
        region: "South America",
        capital: "Georgetown",
        "birth rate": 15.5,
        "death rate": 7.5,
        "population growth": 0.72,
        "labor force": 313800,
        population: 750204,
        "median age": 27.5,
        "GDP(PPP)": 6301000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/GY-flag.gif"
    },
    {
        id: "HT",
        name: "Haiti",
        background: "The native Taino - who inhabited the island of Hispaniola when Christopher COLUMBUS first landed on it in 1492 - were virtually wiped out by Spanish settlers within 25 years. In the early 17th century, the French established a presence on Hispaniola. In 1697, Spain ceded to the French the western third of the island, which later became Haiti. The French colony, based on forestry and sugar-related industries, became one of the wealthiest in the Caribbean but relied heavily on the forced labor of enslaved Africans and environmentally degrading practices. In the late 18th century, Toussaint L'OUVERTURE led a revolution of Haiti's nearly half a million slaves that ended France's rule on the island. After a prolonged struggle, and under the leadership of Jean-Jacques DESSALINES, Haiti became the first country in the world led by former slaves after declaring its independence in 1804, but it was forced to pay an indemnity to France for more than a century and was shunned by other countries for nearly 40 years. After the US occupied Haiti from 1915-1934, Francois \"Papa Doc\" DUVALIER and then his son Jean-Claude Baby Doc DUVALIER led repressive and corrupt regimes that ruled Haiti from 1957-1971 and 1971-1986, respectively. A massive magnitude 7.0 earthquake struck Haiti in January 2010 with an epicenter about 25 km (15 mi) west of the capital, Port-au-Prince. Estimates are that over 300,000 people were killed and some 1.5 million left homeless. The earthquake was assessed as the worst in this region over the last 200 years. On 4 October 2016, Hurricane Matthew made landfall in Haiti, resulting in over 500 deaths and causing extensive damage to crops, houses, livestock, and infrastructure. Currently the poorest country in the Western Hemisphere, Haiti continues to experience bouts of political instability.",
        region: "Central America & The Caribbean",
        capital: "Port-au-Prince",
        "birth rate": 21.7,
        "death rate": 7.4,
        "population growth": 1.26,
        "labor force": 4594000,
        population: 11067777,
        "median age": 24.1,
        "GDP(PPP)": 19970000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/HA-flag.gif"
    },
    {
        id: "HN",
        name: "Honduras",
        background: "Once part of Spain's vast empire in the New World, Honduras became an independent nation in 1821. After two and a half decades of mostly military rule, a freely elected civilian government came to power in 1982. During the 1980s, Honduras proved a haven for anti-Sandinista contras fighting the Marxist Nicaraguan Government and an ally to Salvadoran Government forces fighting leftist guerrillas. The country was devastated by Hurricane Mitch in 1998, which killed about 5,600 people and caused approximately $2 billion in damage. Since then, the economy has slowly rebounded.",
        region: "Central America & The Caribbean",
        capital: "Tegucigalpa",
        "birth rate": 18.5,
        "death rate": 4.7,
        "population growth": 1.27,
        "labor force": 3735000,
        population: 9235340,
        "median age": 24.4,
        "GDP(PPP)": 46300000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/HO-flag.gif"
    },
    {
        id: "HK",
        name: "Hong Kong",
        background: 'Occupied by the UK in 1841, Hong Kong was formally ceded by China the following year; various adjacent lands were added later in the 19th century. Pursuant to an agreement signed by China and the UK on 19 December 1984, Hong Kong became the Hong Kong Special Administrative Region of the People\'s Republic of China on 1 July 1997. In this agreement, China promised that, under its "one country, two systems" formula, China\'s socialist economic system would not be imposed on Hong Kong and that Hong Kong would enjoy a "high degree of autonomy" in all matters except foreign and defense affairs for the subsequent 50 years.',
        region: "Asia",
        capital: "Hong Kong",
        "birth rate": 8.4,
        "death rate": 7.9,
        "population growth": 0.24,
        "labor force": 3965000,
        population: 7249907,
        "median age": 45.6,
        "GDP(PPP)": 480500000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/HK-flag.gif"
    },
    {
        id: "HU",
        name: "Hungary",
        background: 'Hungary became a Christian kingdom in A.D. 1000 and for many centuries served as a bulwark against Ottoman Turkish expansion in Europe. The kingdom eventually became part of the polyglot Austro-Hungarian Empire, which collapsed during World War I. The country fell under communist rule following World War II. In 1956, a revolt and an announced withdrawal from the Warsaw Pact were met with a massive military intervention by Moscow. Under the leadership of Janos KADAR in 1968, Hungary began liberalizing its economy, introducing so-called "Goulash Communism." Hungary held its first multiparty elections in 1990 and initiated a free market economy. It joined NATO in 1999 and the EU five years later.',
        region: "Europe",
        capital: "Budapest",
        "birth rate": 8.8,
        "death rate": 12.9,
        "population growth": -0.28,
        "labor force": 4599000,
        population: 9771827,
        "median age": 43.6,
        "GDP(PPP)": 289600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/HU-flag.gif"
    },
    {
        id: "IS",
        name: "Iceland",
        background: "Settled by Norwegian and Celtic (Scottish and Irish) immigrants during the late 9th and 10th centuries A.D., Iceland boasts the world's oldest functioning legislative assembly, the Althingi, established in 930. Independent for over 300 years, Iceland was subsequently ruled by Norway and Denmark. Fallout from the Askja volcano of 1875 devastated the Icelandic economy and caused widespread famine. Over the next quarter century, 20% of the island's population emigrated, mostly to Canada and the US. Denmark granted limited home rule in 1874 and complete independence in 1944. The second half of the 20th century saw substantial economic growth driven primarily by the fishing industry. The economy diversified greatly after the country joined the European Economic Area in 1994, but Iceland was especially hard hit by the global financial crisis in the years following 2008. The economy is now on an upward trajectory, fueled primarily by a tourism and construction boom. Literacy, longevity, and social cohesion are first rate by world standards.",
        region: "Europe",
        capital: "Reykjavik",
        "birth rate": 13.3,
        "death rate": 6.6,
        "population growth": 1.02,
        "labor force": 198700,
        population: 350734,
        "median age": 37.1,
        "GDP(PPP)": 18180000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/IC-flag.gif"
    },
    {
        id: "IN",
        name: "India",
        background: "The Indus Valley civilization, one of the world's oldest, flourished during the 3rd and 2nd millennia B.C. and extended into northwestern India. Aryan tribes from the northwest infiltrated the Indian subcontinent about 1500 B.C.; their merger with the earlier Dravidian inhabitants created the classical Indian culture. The Maurya Empire of the 4th and 3rd centuries B.C. - which reached its zenith under ASHOKA - united much of South Asia. The Golden Age ushered in by the Gupta dynasty (4th to 6th centuries A.D.) saw a flowering of Indian science, art, and culture. Islam spread across the subcontinent over a period of 700 years. In the 10th and 11th centuries, Turks and Afghans invaded India and established the Delhi Sultanate. In the early 16th century, the Emperor BABUR established the Mughal Dynasty, which ruled India for more than three centuries. European explorers began establishing footholds in India during the 16th century.By the 19th century, Great Britain had become the dominant political power on the subcontinent and India was seen as the \"Jewel in the Crown\" of the British Empire. The British Indian Army played a vital role in both World Wars. Years of nonviolent resistance to British rule, led by Mohandas GANDHI and Jawaharlal NEHRU, eventually resulted in Indian independence in 1947. Large-scale communal violence took place before and after the subcontinent partition into two separate states - India and Pakistan. The neighboring countries have fought three wars since independence, the last of which was in 1971 and resulted in East Pakistan becoming the separate nation of Bangladesh. India's nuclear weapons tests in 1998 emboldened Pakistan to conduct its own tests that same year. In November 2008, terrorists originating from Pakistan conducted a series of coordinated attacks in Mumbai, India's financial capital. India's economic growth following the launch of economic reforms in 1991, a massive youthful population, and a strategic geographic location have contributed to India's emergence as a regional and global power. However, India still faces pressing problems such as environmental degradation, extensive poverty, and widespread corruption, and its restrictive business climate is dampening economic growth expectations.",
        region: "Asia",
        capital: "New Delhi",
        "birth rate": 18.2,
        "death rate": 7.3,
        "population growth": 1.1,
        "labor force": 521900000,
        population: 1326093247,
        "median age": 28.7,
        "GDP(PPP)": 9474000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/IN-flag.gif"
    },
    {
        id: "ID",
        name: "Indonesia",
        background: "The Dutch began to colonize Indonesia in the early 17th century; Japan occupied the islands from 1942 to 1945. Indonesia declared its independence shortly before Japan's surrender, but it required four years of sometimes brutal fighting, intermittent negotiations, and UN mediation before the Netherlands agreed to transfer sovereignty in 1949. A period of sometimes unruly parliamentary democracy ended in 1957 when President SOEKARNO declared martial law and instituted \"Guided Democracy.\" After an abortive coup in 1965 by alleged communist sympathizers, SOEKARNO was gradually eased from power. From 1967 until 1998, President SUHARTO ruled Indonesia with his \"New Order\" government. After street protests toppled SUHARTO in 1998, free and fair legislative elections took place in 1999. Indonesia is now the world's third most populous democracy, the world's largest archipelagic state, and the world's largest Muslim-majority nation. Current issues include: alleviating poverty, improving education, preventing terrorism, consolidating democracy after four decades of authoritarianism, implementing economic and financial reforms, stemming corruption, reforming the criminal justice system, addressing climate change, and controlling infectious diseases, particularly those of global and regional importance. In 2005, Indonesia reached a historic peace agreement with armed separatists in Aceh, which led to democratic elections in Aceh in December 2006. Indonesia continues to face low intensity armed resistance in Papua by the separatist Free Papua Movement.",
        region: "Asia",
        capital: "Jakarta",
        "birth rate": 15.4,
        "death rate": 6.6,
        "population growth": 0.79,
        "labor force": 125000000,
        population: 267026366,
        "median age": 31.1,
        "GDP(PPP)": 3250000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/ID-flag.gif"
    },
    {
        id: "IR",
        name: "Iran",
        background: "Known as Persia until 1935, Iran became an Islamic republic in 1979 after the ruling monarchy was overthrown and Shah Mohammad Reza PAHLAVI was forced into exile. Conservative clerical forces led by Ayatollah Ruhollah KHOMEINI established a theocratic system of government with ultimate political authority vested in a learned religious scholar referred to commonly as the Supreme Leader who, according to the constitution, is accountable only to the Assembly of Experts (AOE) - a popularly elected 88-member body of clerics. US-Iranian relations became strained when a group of Iranian students seized the US Embassy in Tehran in November 1979 and held embassy personnel hostages until mid-January 1981. The US cut off diplomatic relations with Iran in April 1980. During the period 1980-88, Iran fought a bloody, indecisive war with Iraq that eventually expanded into the Persian Gulf and led to clashes between US Navy and Iranian military forces. Iran has been designated a state sponsor of terrorism and was subject to US, UN, and EU economic sanctions and export controls because of its continued involvement in terrorism and concerns over possible military dimensions of its nuclear program until Joint Comprehensive Plan of Action (JCPOA) Implementation Day in 2016. The US began gradually re-imposing sanctions on Iran after the US withdrawal from JCPOA in May 2018. Following the election of reformer Hojjat ol-Eslam Mohammad KHATAMI as president in 1997 and a reformist Majles (legislature) in 2000, a campaign to foster political reform in response to popular dissatisfaction was initiated. The movement floundered as conservative politicians, supported by the Supreme Leader, unelected institutions of authority like the Council of Guardians, and the security services reversed and blocked reform measures while increasing security repression. Starting with nationwide municipal elections in 2003 and continuing through Majles elections in 2004, conservatives reestablished control over Iran's elected government institutions, which culminated with the August 2005 inauguration of hardliner Mahmud AHMADI-NEJAD as president. His controversial reelection in June 2009 sparked nationwide protests over allegations of electoral fraud, but the protests were quickly suppressed. Deteriorating economic conditions due primarily to government mismanagement and international sanctions prompted at least two major economically based protests in July and October 2012, but Iran's internal security situation remained stable. President AHMADI-NEJAD's independent streak angered regime establishment figures, including the Supreme Leader, leading to conservative opposition to his agenda for the last year of his presidency, and an alienation of his political supporters. In June 2013 Iranians elected a centrist cleric Dr. Hasan Fereidun ROHANI to the presidency. He is a longtime senior member in the regime, but has made promises of reforming society and Iran's foreign policy. The UN Security Council has passed a number of resolutions calling for Iran to suspend its uranium enrichment and reprocessing activities and comply with its IAEA obligations and responsibilities, and in July 2015 Iran and the five permanent members, plus Germany (P5+1) signed the JCPOA under which Iran agreed to restrictions on its nuclear program in exchange for sanctions relief. Iran held elections in 2016 for the AOE and Majles, resulting in a conservative-controlled AOE and a Majles that many Iranians perceive as more supportive of the ROHANI administration than the previous, conservative-dominated body. ROHANI was reelected president in May 2017. Economic concerns once again led to nationwide protests in December 2017 and January 2018 but they were contained by Iran's security services. Additional widespread economic protests broke out in November 2019 in response to the raised price of subsidized gasoline.",
        region: "Middle East",
        capital: "Tehran",
        "birth rate": 16.3,
        "death rate": 5.3,
        "population growth": 1.1,
        "labor force": 30500000,
        population: 84923314,
        "median age": 31.7,
        "GDP(PPP)": 1640000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/IR-flag.gif"
    },
    {
        id: "IQ",
        name: "Iraq",
        background: "Formerly part of the Ottoman Empire, Iraq was occupied by the United Kingdom during World War I andwas declared a League of Nations mandate under UK administration in 1920. Iraq attained its independence as a kingdom in 1932. It was proclaimed a \"republic\" in 1958 after a coup overthrew the monarchy, but in actuality, a series of strongmen ruled the country until 2003. The last was SADDAM Husayn from 1979 to 2003. Territorial disputes with Iran led to an inconclusive and costly eight-year war (1980-88). In August 1990, Iraq seized Kuwait but was expelled by US-led UN coalition forces during the Gulf War of January-February 1991. After Iraq's expulsion, the UN Security Council (UNSC) required Iraq to scrap all weapons of mass destruction and long-range missiles and to allow UN verification inspections. Continued Iraqi noncompliance with UNSC resolutions led to the Second Gulf War in March 2003 and the ouster of the SADDAM Husayn regime by US-led forces.In October 2005, Iraqis approved a constitution in a national referendum and, pursuant to this document, elected a 275-member Council of Representatives (COR) in December 2005. The COR approved most cabinet ministers in May 2006, marking the transition to Iraq's first constitutional government in nearly a half century. Iraq held elections for provincial councils in all governorates in January 2009 and April 2013 and postponed the next provincial elections, originally planned for April 2017, until 2019. Iraq has held three national legislative elections since 2005, most recently in May 2018 when 329 legislators were elected to the COR. Adil ABD AL-MAHDI assumed the premiership in October 2018 as a consensus and independent candidate - the first prime minister who is not an active member of a major political bloc. However, widespread protests that began in October 2019 demanding more employment opportunities and an end to corruption prompted ABD AL-MAHDI to announce his resignation on 20 November 2019.Between 2014 and 2017, Iraq was engaged in a military campaign against the Islamic State of Iraq and ash-Sham (ISIS) to recapture territory lost in the western and northern portion of the country. Iraqi and allied forces recaptured Mosul, the country's second-largest city, in 2017 and drove ISIS out of its other urban strongholds. In December 2017, then-Prime Minister Haydar al-ABADI publicly declared victory against ISIS while continuing operations against the group's residual presence in rural areas. Also in late 2017, ABADI responded to an independence referendum held by the Kurdistan Regional Government by ordering Iraqi forces to take control of disputed territories across central and northern Iraq that were previously occupied and governed by Kurdish forces.",
        region: "Middle East",
        capital: "Baghdad",
        "birth rate": 25.7,
        "death rate": 3.9,
        "population growth": 2.16,
        "labor force": 8900000,
        population: 38872655,
        "median age": 21.2,
        "GDP(PPP)": 649300000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/IZ-flag.gif"
    },
    {
        id: "IE",
        name: "Ireland",
        background: "Celtic tribes arrived on the island between 600 and 150 B.C. Invasions by Norsemen that began in the late 8th century were finally ended when King Brian BORU defeated the Danes in 1014. Norman invasions began in the 12th century and set off more than seven centuries of Anglo-Irish struggle marked by fierce rebellions and harsh repressions. The Irish famine of the mid-19th century was responsible for a drop in the island's population by more than one quarter through starvation, disease, and emigration. For more than a century afterward, the population of the island continued to fall only to begin growing again in the 1960s. Over the last 50 years, Ireland's high birthrate has made it demographically one of the youngest populations in the EU.The modern Irish state traces its origins to the failed 1916 Easter Monday Uprising that touched off several years of guerrilla warfare resulting in independence from the UK in 1921 for 26 southern counties; six northern (Ulster) counties remained part of the UK. Deep sectarian divides between the Catholic and Protestant populations and systemic discrimination in Northern Ireland erupted into years of violence known as the \"Troubles\" that began in the 1960s. The Government of Ireland was part of a process along with the UK and US Governments that helped broker the Good Friday Agreement in Northern Ireland in 1998. This initiated a new phase of cooperation between the Irish and British Governments. Ireland was neutral in World War II and continues its policy of military neutrality. Ireland joined the European Community in 1973 and the euro-zone currency union in 1999. The economic boom years of the Celtic Tiger (1995-2007) saw rapid economic growth, which came to an abrupt end in 2008 with the meltdown of the Irish banking system. Today the economy is recovering, fueled by large and growing foreign direct investment, especially from US multi-nationals.",
        region: "Europe",
        capital: "Dublin",
        "birth rate": 13,
        "death rate": 6.8,
        "population growth": 1.04,
        "labor force": 2226000,
        population: 5176569,
        "median age": 37.8,
        "GDP(PPP)": 353300000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/EI-flag.gif"
    },
    {
        id: "IM",
        name: "Isle of Man",
        background: "Part of the Norwegian Kingdom of the Hebrides until the 13th century when it was ceded to Scotland, the isle came under the British crown in 1765. Current concerns include reviving the almost extinct Manx Gaelic language. The Isle of Man is a British Crown dependency, which makes it a self-governing possession of the British Crown that is not part of the UK. The UK Government, however, remains constitutionally responsible for its defense and international representation.",
        region: "Europe",
        capital: "Douglas",
        "birth rate": 10.8,
        "death rate": 10.4,
        "population growth": 0.59,
        "labor force": 41790,
        population: 90499,
        "median age": 44.6,
        "GDP(PPP)": 6792000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/IM-flag.gif"
    },
    {
        id: "IL",
        name: "Israel",
        background: "The State of Israel was declared in 1948, after Britain withdrew from its mandate of Palestine. The UN proposed partitioning the area into Arab and Jewish states, and Arab armies that rejected the UN plan were defeated. Israel was admitted as a member of the UN in 1949 and saw rapid population growth, primarily due to migration from Europe and the Middle East, over the following years. Israel fought wars against its Arab neighbors in 1967 and 1973, followed by peace treaties with Egypt in 1979 and Jordan in 1994. Israel took control of the West Bank and Gaza Strip in the 1967 war, and subsequently administered those territories through military authorities. Israel and Palestinian officials signed a number of interim agreements in the 1990s that created an interim period of Palestinian self-rule in the West Bank and Gaza. Israel withdrew from Gaza in 2005. While the most recent formal efforts to negotiate final status issues occurred in 2013-2014, the US continues its efforts to advance peace. Immigration to Israel continues, with 28,600 new immigrants, mostly Jewish, in 2016. The Israeli economy has undergone a dramatic transformation in the last 25 years, led by cutting-edge, high-tech sectors. Offshore gas discoveries in the Mediterranean, most notably in the Tamar and Leviathan gas fields, place Israel at the center of a potential regional natural gas market. However, longer-term structural issues such as low labor force participation among minority populations, low workforce productivity, high costs for housing and consumer staples, and a lack of competition, remain a concern for many Israelis and an important consideration for Israeli politicians. Prime Minister Benjamin NETANYAHU has led the Israeli Government since 2009; he formed a center-right coalition following the 2015 elections. In December 2018 the Knesset voted to dissolve itself, leading to an election in April 2019. When that election failed to result in formation of a government, Israel held a second election in September 2019, which also failed to result in the formation of a government. On 11 December 2019, the Knesset voted to hold a third election on 2 March 2020.",
        region: "Middle East",
        capital: "Jerusalem",
        "birth rate": 17.6,
        "death rate": 5.3,
        "population growth": 1.46,
        "labor force": 4021000,
        population: 8675475,
        "median age": 30.4,
        "GDP(PPP)": 317100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/IS-flag.gif"
    },
    {
        id: "IT",
        name: "Italy",
        background: "Italy became a nation-state in 1861 when the regional states of the peninsula, along with Sardinia and Sicily, were united under King Victor EMMANUEL II. An era of parliamentary government came to a close in the early 1920s when Benito MUSSOLINI established a Fascist dictatorship. His alliance with Nazi Germany led to Italy's defeat in World War II. A democratic republic replaced the monarchy in 1946 and economic revival followed. Italy is a charter member of NATO and the European Economic Community (EEC) and its subsequent successors the EC and the EU. It has been at the forefront of European economic and political unification, joining the Economic and Monetary Union in 1999. Persistent problems include sluggish economic growth, high youth and female unemployment, organized crime, corruption, and economic disparities between southern Italy and the more prosperous north.",
        region: "Europe",
        capital: "Rome",
        "birth rate": 8.4,
        "death rate": 10.7,
        "population growth": 0.11,
        "labor force": 25940000,
        population: 62402659,
        "median age": 46.5,
        "GDP(PPP)": 2317000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/IT-flag.gif"
    },
    {
        id: "JM",
        name: "Jamaica",
        background: "The island - discovered by Christopher COLUMBUS in 1494 - was settled by the Spanish early in the 16th century. The native Taino, who had inhabited Jamaica for centuries, were gradually exterminated and replaced by African slaves. England seized the island in 1655 and established a plantation economy based on sugar, cocoa, and coffee. The abolition of slavery in 1834 freed a quarter million slaves, many of whom became small farmers. Jamaica gradually increased its independence from Britain. In 1958 it joined other British Caribbean colonies in forming the Federation of the West Indies. Jamaica withdrew from the Federation in 1961 and gained full independence in 1962. Deteriorating economic conditions during the 1970s led to recurrent violence as rival gangs affiliated with the major political parties evolved into powerful organized crime networks involved in international drug smuggling and money laundering. Violent crime, drug trafficking, and poverty pose significant challenges to the government today. Nonetheless, many rural and resort areas remain relatively safe and contribute substantially to the economy.",
        region: "Central America & The Caribbean",
        capital: "Kingston",
        "birth rate": 16.1,
        "death rate": 7.5,
        "population growth": -0.07,
        "labor force": 1348000,
        population: 2808570,
        "median age": 29.4,
        "GDP(PPP)": 26060000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/JM-flag.gif"
    },
    {
        id: "JP",
        name: "Japan",
        background: "In 1603, after decades of civil warfare, the Tokugawa shogunate (a military-led, dynastic government) ushered in a long period of relative political stability and isolation from foreign influence. For more than two centuries this policy enabled Japan to enjoy a flowering of its indigenous culture. Japan opened its ports after signing the Treaty of Kanagawa with the US in 1854 and began to intensively modernize and industrialize. During the late 19th and early 20th centuries, Japan became a regional power that was able to defeat the forces of both China and Russia. It occupied Korea, Formosa (Taiwan), and southern Sakhalin Island. In 1931-32 Japan occupied Manchuria, and in 1937 it launched a full-scale invasion of China. Japan attacked US forces in 1941 - triggering America's entry into World War II - and soon occupied much of East and Southeast Asia. After its defeat in World War II, Japan recovered to become an economic power and an ally of the US. While the emperor retains his throne as a symbol of national unity, elected politicians hold actual decision-making power. Following three decades of unprecedented growth, Japan's economy experienced a major slowdown starting in the 1990s, but the country remains an economic power. In March 2011, Japan's strongest-ever earthquake, and an accompanying tsunami, devastated the northeast part of Honshu island, killed thousands, and damaged several nuclear power plants. Prime Minister Shinzo ABE was reelected to office in December 2012, and has since embarked on ambitious economic and security reforms to improve Japan's economy and bolster the country's international standing. In November 2019, ABE became Japan's longest-serving post-war prime minister.",
        region: "Asia",
        capital: "Tokyo",
        "birth rate": 7.3,
        "death rate": 10.2,
        "population growth": -0.27,
        "labor force": 65010000,
        population: 125507472,
        "median age": 48.6,
        "GDP(PPP)": 5443000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/JA-flag.gif"
    },
    {
        id: "JE",
        name: "Jersey",
        background: "Jersey and the other Channel Islands represent the last remnants of the medieval Duchy of Normandy that held sway in both France and England. These islands were the only British soil occupied by German troops in World War II. The Bailiwick of Jersey is a British Crown dependency, which means that it is not part of the UK but is rather a self-governing possession of the British Crown. However, the UK Government is constitutionally responsible for its defense and international representation.",
        region: "Europe",
        capital: "Saint Helier",
        "birth rate": 12.7,
        "death rate": 7.9,
        "population growth": 0.72,
        "labor force": 59950,
        population: 101073,
        "median age": 37.5,
        "GDP(PPP)": 5569000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/JE-flag.gif"
    },
    {
        id: "JO",
        name: "Jordan",
        background: "Following World War I and the dissolution of the Ottoman Empire, the League of Nations awarded Britain the mandate to govern much of the Middle East. Britain demarcated a semi-autonomous region of Transjordan from Palestine in the early 1920s. The area gained its independence in 1946 and thereafter became The Hashemite Kingdom of Jordan. The country's long-time ruler, King HUSSEIN (1953-99), successfully navigated competing pressures from the major powers (US, USSR, and UK), various Arab states, Israel, and a large internal Palestinian population. Jordan lost the West Bank to Israel in the 1967 Six-Day War. King HUSSEIN in 1988 permanently relinquished Jordanian claims to the West Bank; in 1994 he signed a peace treaty with Israel. King ABDALLAH II, King HUSSEIN's eldest son, assumed the throne following his father's death in 1999. He has implemented modest political reforms, including the passage of a new electoral law in early 2016 and an effort to devolve some authority to governorate- and municipal-level councils following subnational elections in 2017. In 2016, the Islamic Action Front, which is the political arm of the Jordanian Muslim Brotherhood, returned to the National Assembly with 15 seats after boycotting the previous two elections in 2010 and 2013.",
        region: "Middle East",
        capital: "Amman",
        "birth rate": 23,
        "death rate": 3.4,
        "population growth": 1.4,
        "labor force": 2295000,
        population: 10820644,
        "median age": 23.5,
        "GDP(PPP)": 89000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/JO-flag.gif"
    },
    {
        id: "KZ",
        name: "Kazakhstan",
        background: "Ethnic Kazakhs, a mix of Turkic and Mongol nomadic tribes with additional Persian cultural influences, migrated to the region in the 15th century. The area was conquered by Russia in the 18th and 19th centuries, and Kazakhstan became a Soviet Republic in 1925. Repression and starvation associated with forced agricultural collectivization led to a massive number of deaths in the 1930s. During the 1950s and 1960s, the agricultural \"Virgin Lands\" program led to an influx of settlers (mostly ethnic Russians, but also other nationalities) and at the time of Kazakhstans independence in 1991, ethnic Kazakhs were a minority. Non-Muslim ethnic minorities departed Kazakhstan in large numbers from the mid-1990s through the mid-2000s and a national program has repatriated about a million ethnic Kazakhs (from Uzbekistan, Tajikistan, Mongolia, and the Xinjiang region of China) back to Kazakhstan. As a result of this shift, the ethnic Kazakh share of the population now exceeds two-thirds.Kazakhstan's economy is the largest in the Central Asian states, mainly due to the country's vast natural resources. Current issues include: diversifying the economy, obtaining membership in global and regional international economic institutions, enhancing Kazakhstan's economic competitiveness, and strengthening relations with neighboring states and foreign powers.",
        region: "Asia",
        capital: "Nur-Sultan",
        "birth rate": 16.4,
        "death rate": 8.2,
        "population growth": 0.89,
        "labor force": 8970000,
        population: 19091949,
        "median age": 31.6,
        "GDP(PPP)": 478600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/KZ-flag.gif"
    },
    {
        id: "KE",
        name: "Kenya",
        background: "Founding president and liberation struggle icon Jomo KENYATTA led Kenya from independence in 1963 until his death in 1978, when Vice President Daniel Arap MOI took power in a constitutional succession. The country was a de facto one-party state from 1969 until 1982, after which time the ruling Kenya African National Union (KANU) changed the constitution to make itself the sole legal party in Kenya. MOI acceded to internal and external pressure for political liberalization in late 1991. The ethnically fractured opposition failed to dislodge KANU from power in elections in 1992 and 1997, which were marred by violence and fraud. President MOI stepped down in December 2002 following fair and peaceful elections. Mwai KIBAKI, running as the candidate of the multiethnic, united opposition group, the National Rainbow Coalition (NARC), defeated KANU candidate Uhuru KENYATTA, the son of founding president Jomo KENYATTA, and assumed the presidency following a campaign centered on an anticorruption platform.KIBAKI's reelection in December 2007 brought charges of vote rigging from Orange Democratic Movement (ODM) candidate Raila ODINGA and unleashed two months of violence in which approximately 1,100 people died. African Union-sponsored mediation led by former UN Secretary General Kofi ANNAN in late February 2008 resulted in a power-sharing accord bringing ODINGA into the government in the restored position of prime minister. The power sharing accord included a broad reform agenda, the centerpiece of which was constitutional reform. In August 2010, Kenyans overwhelmingly adopted a new constitution in a national referendum. The new constitution introduced additional checks and balances to executive power and devolved power and resources to 47 newly created counties. It also eliminated the position of prime minister. Uhuru KENYATTA won the first presidential election under the new constitution in March 2013, and was sworn into office the following month; he began a second term in November 2017 following a contentious, repeat election.",
        region: "Africa",
        capital: "Nairobi",
        "birth rate": 27.2,
        "death rate": 5.2,
        "population growth": 2.2,
        "labor force": 19600000,
        population: 53527936,
        "median age": 20,
        "GDP(PPP)": 163700000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/KE-flag.gif"
    },
    {
        id: "KI",
        name: "Kiribati",
        background: "The Gilbert Islands became a British protectorate in 1892 and a colony in 1915; they were captured by the Japanese in the Pacific War in 1941. The islands of Makin and Tarawa were the sites of major US amphibious victories over entrenched Japanese garrisons in 1943. The Gilbert Islands were granted self-rule by the UK in 1971 and complete independence in 1979 under the new name of Kiribati. The US relinquished all claims to the sparsely inhabited Phoenix and Line Island groups in a 1979 treaty of friendship with Kiribati. Kiribati joined the UN in 1999 and has been an active participant in international efforts to combat climate change.",
        region: "Oceania",
        capital: "Tarawa",
        "birth rate": 20.5,
        "death rate": 6.9,
        "population growth": 1.09,
        "labor force": 39000,
        population: 111796,
        "median age": 25.7,
        "GDP(PPP)": 227000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/KR-flag.gif"
    },
    {
        id: "KP",
        name: "North Korea",
        background: "An independent kingdom for much of its long history, Korea was occupied by Japan beginning in 1905 following the Russo-Japanese War. Five years later, Japan formally annexed the entire peninsula. Following World War II, Korea was split with the northern half coming under Soviet-sponsored communist control. After failing in the Korean War (1950-53) to conquer the US-backed Republic of Korea (ROK) in the southern portion by force, North Korea (DPRK), under its founder President KIM Il Sung, adopted a policy of ostensible diplomatic and economic \"self-reliance\" as a check against outside influence. The DPRK demonized the US as the ultimate threat to its social system through state-funded propaganda, and molded political, economic, and military policies around the core ideological objective of eventual unification of Korea under Pyongyang's control. KIM Il Sung's son, KIM Jong Il, was officially designated as his father's successor in 1980, assuming a growing political and managerial role until the elder KIM's death in 1994. Under KIM Jong Il's rein, the DPRK continued developing nuclear weapons and ballistic missiles. KIM Jong Un was publicly unveiled as his father's successor in 2010. Following KIM Jong Il's death in 2011, KIM Jong Un quickly assumed power and has since occupied the regime's highest political and military posts.After decades of economic mismanagement and resource misallocation, the DPRK since the mid-1990s has faced chronic food shortages. In recent years, the North's domestic agricultural production has increased, but still falls far short of producing sufficient food to provide for its entire population. The DPRK began to ease restrictions to allow semi-private markets, starting in 2002, but has made few other efforts to meet its goal of improving the overall standard of living. North Korea's history of regional military provocations; proliferation of military-related items; long-range missile development; WMD programs including tests of nuclear devices in 2006, 2009, 2013, 2016, and 2017; and massive conventional armed forces are of major concern to the international community and have limited the DPRK's international engagement, particularly economically. In 2013, the DPRK declared apolicy of simultaneous development of its nuclear weapons program and economy. In late 2017, KIM Jong Un declared the North's nuclear weapons development complete. In 2018, KIM announced a pivot towards diplomacy, including a re-prioritization of economic development, a pause in missile testing beginning in late 2017, and a refrain from anti-US rhetoric starting in June 2018. Since 2018, KIM has participated in four meetings with Chinese President XI Jinping, three with ROK President MOON Jae-in, and three with US President TRUMP. Since July 2019, North Korea has restarted its short-range missile tests and issued statements condemning the US.",
        region: "Asia",
        capital: "Pyongyang",
        "birth rate": 14.5,
        "death rate": 9.4,
        "population growth": 0.51,
        "labor force": 14000000,
        population: 25643466,
        "median age": 34.6,
        "GDP(PPP)": 40000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/KN-flag.gif"
    },
    {
        id: "KR",
        name: "South Korea",
        background: "An independent kingdom for much of its long history, Korea was occupied by Japan beginning in 1905 following the Russo-Japanese War. In 1910, Tokyo formally annexed the entire Peninsula. Korea regained its independence following Japan's surrender to the US in 1945. After World War II, a democratic government (Republic of Korea, ROK) was set up in the southern half of the Korean Peninsula while a communist-style government was installed in the north (Democratic People's Republic of Korea, DPRK). During the Korean War (1950-53), US troops and UN forces fought alongside ROK soldiers to defend South Korea from a DPRK invasion supported by communist China and the Soviet Union. A 1953 armistice split the Peninsula along a demilitarized zone at about the 38th parallel. PARK Chung-hee took over leadership of the country in a 1961 coup. During his regime, from 1961 to 1979, South Korea achieved rapid economic growth, with per capita income rising to roughly 17 times the level of North Korea in 1979.South Korea held its first free presidential election under a revised democratic constitution in 1987, with former ROK Army general ROH Tae-woo winning a close race. In 1993, KIM Young-sam (1993-98) became the first civilian president of South Korea's new democratic era. President KIM Dae-jung (1998-2003) won the Nobel Peace Prize in 2000 for his contributions to South Korean democracy and his \"Sunshine\" policy of engagement with North Korea. President PARK Geun-hye, daughter of former ROK President PARK Chung-hee, took office in February 2013 as South Korea's first female leader. In December 2016, the National Assembly passed an impeachment motion against President PARK over her alleged involvement in a corruption and influence-peddling scandal, immediately suspending her presidential authorities. The impeachment was upheld in March 2017, triggering an early presidential election in May 2017 won by MOON Jae-in. South Korea hosted the Winter Olympic and Paralympic Games in February 2018, in which North Korea also participated. Discord with North Korea has permeated inter-Korean relations for much of the past decade, highlighted by the North's attacks on a South Korean ship and island in 2010, the exchange of artillery fire across the DMZ in 2015, and multiple nuclear and missile tests in 2016 and 2017. North Koreas participation in the Winter Olympics, dispatch of a senior delegation to Seoul, and three inter-Korean summits in 2018 appear to have ushered in a temporary period of respite, buoyed by the historic US-DPRK summits in 2018 and 2019.",
        region: "Asia",
        capital: "Seoul",
        "birth rate": 8.2,
        "death rate": 6.8,
        "population growth": 0.39,
        "labor force": 27750000,
        population: 51835110,
        "median age": 43.2,
        "GDP(PPP)": 2035000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/KS-flag.gif"
    },
    {
        id: "XK",
        name: "Kosovo",
        background: "The central Balkans were part of the Roman and Byzantine Empires before ethnic Serbs migrated to the territories of modern Kosovo in the 7th century. During the medieval period, Kosovo became the center of a Serbian Empire and saw the construction of many important Serb religious sites, including many architecturally significant Serbian Orthodox monasteries. The defeat of Serbian forces at the Battle of Kosovo in 1389 led to five centuries of Ottoman rule during which large numbers of Turks and Albanians moved to Kosovo. By the end of the 19th century, Albanians replaced Serbs as the dominant ethnic group in Kosovo. Serbia reacquired control over the region from the Ottoman Empire during the First Balkan War of 1912. After World War II, Kosovo's present-day boundaries were established when Kosovo became an autonomous province of Serbia in the Socialist Federal Republic of Yugoslavia (S.F.R.Y.). Despite legislative concessions, Albanian nationalism increased in the 1980s, which led to riots and calls for Kosovo's independence. The Serbs - many of whom viewed Kosovo as their cultural heartland - instituted a new constitution in 1989 revoking Kosovo's autonomous status. Kosovo's Albanian leaders responded in 1991 by organizing a referendum declaring Kosovo independent. Serbia undertook repressive measures against the Kosovar Albanians in the 1990s, provoking a Kosovar Albanian insurgency.Beginning in 1998, Serbia conducted a brutal counterinsurgency campaign that resulted in massacres and massive expulsions of ethnic Albanians (some 800,000 ethnic Albanians were forced from their homes in Kosovo). After international attempts to mediate the conflict failed, a three-month NATO military operation against Serbia beginning in March 1999 forced the Serbs to agree to withdraw their military and police forces from Kosovo. UN Security Council Resolution 1244 (1999) placed Kosovo under a transitional administration, the UN Interim Administration Mission in Kosovo (UNMIK), pending a determination of Kosovo's future status. A UN-led process began in late 2005 to determine Kosovo's final status. The 2006-07 negotiations ended without agreement between Belgrade and Pristina, though the UN issued a comprehensive report on Kosovo's final status that endorsed independence. On 17 February 2008, the Kosovo Assembly declared Kosovo independent. Since then, over 100 countries have recognized Kosovo, and it has joined numerous international organizations. In October 2008, Serbia sought an advisory opinion from the International Court of Justice (ICJ) on the legality under international law of Kosovo's declaration of independence. The ICJ released the advisory opinion in July 2010 affirming that Kosovo's declaration of independence did not violate general principles of international law, UN Security Council Resolution 1244, or the Constitutive Framework. The opinion was closely tailored to Kosovo's unique history and circumstances.Demonstrating Kosovos development into a sovereign, multi-ethnic, democratic country the international community ended the period of Supervised Independence in 2012. Kosovo held its most recent national and municipal elections in 2017. Serbia continues to reject Kosovo's independence, but the two countries agreed in April 2013 to normalize their relations through EU-facilitated talks, which produced several subsequent agreements the parties are engaged in implementing, though they have not yet reached a comprehensive normalization of relations. Kosovo seeks full integration into the international community, and has pursued bilateral recognitions and memberships in international organizations. Kosovo signed a Stabilization and Association Agreement with the EU in 2015, and was named by a 2018 EU report as one of six Western Balkan countries that will be able to join the organization once it meets the criteria to accede. Kosovo also seeks memberships in the UN and in NATO.",
        region: "Europe",
        capital: "Pristina",
        "birth rate": 15.4,
        "death rate": 7,
        "population growth": 0.66,
        "labor force": 500300,
        population: 1932774,
        "median age": 30.5,
        "GDP(PPP)": 19600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/KV-flag.gif"
    },
    {
        id: "KW",
        name: "Kuwait",
        background: "Kuwait has been ruled by the AL-SABAH dynasty since the 18th century. The threat of Ottoman invasion in 1899 prompted Amir Mubarak AL-SABAH to seek protection from Britain, ceding foreign and defense responsibility to Britain until 1961, when the country attained its independence. Kuwait was attacked and overrun by Iraq in August 1990. Following several weeks of aerial bombardment, a US-led UN coalition began a ground assault in February 1991 that liberated Kuwait in four days. In 1992, the Amir reconstituted the parliament that he had dissolved in 1986. Amid the 2010-11 uprisings and protests across the Arab world, stateless Arabs, known as Bidoon, staged small protests in early 2011 demanding citizenship, jobs, and other benefits available to Kuwaiti nationals. Other demographic groups, notably Islamists and Kuwaitis from tribal backgrounds, soon joined the growing protest movements, which culminated in late 2011 with the resignation of the prime minister amidst allegations of corruption. Demonstrations renewed in late 2012 in response to an amiri decree amending the electoral law that lessened the voting power of the tribal blocs. An opposition coalition of Sunni Islamists, tribal populists, and some liberals, largely boycotted legislative elections in 2012 and 2013, which ushered in a legislature more amenable to the government's agenda. Faced with the prospect of painful subsidy cuts, oppositionists and independents actively participated in the November 2016 election, winning nearly half of the seats but a cohesive opposition alliance largely ceased to exist with the 2016 election and the opposition became increasingly factionalized. Since coming to power in 2006, the Amir has dissolved the National Assembly on seven occasions (the Constitutional Court annulled the Assembly elections in June 2012 and again in June 2013) and shuffled the cabinet over a dozen times, usually citing political stagnation and gridlock between the legislature and the government.",
        region: "Middle East",
        capital: "Kuwait City",
        "birth rate": 18,
        "death rate": 2.3,
        "population growth": 1.27,
        "labor force": 2695000,
        population: 2993706,
        "median age": 29.7,
        "GDP(PPP)": 289700000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/KU-flag.gif"
    },
    {
        id: "KG",
        name: "Kyrgyzstan",
        background: "A Central Asian country of incredible natural beauty and proud nomadic traditions, most of the territory of the present-day Kyrgyz Republic was formally annexed to the Russian Empire in 1876. The Kyrgyz staged a major revolt against the Tsarist Empire in 1916 in which almost one-sixth of the Kyrgyz population was killed. The Kyrgyz Republic became a Soviet republic in 1936 and achieved independence in 1991 when the USSR dissolved. Nationwide demonstrations in 2005 and 2010 resulted in the ouster of the countrys first two presidents, Askar AKAEV and Kurmanbek BAKIEV. Interim President Roza OTUNBAEVA led a transitional government and following a nation-wide election, President Almazbek ATAMBAEV was sworn in as president in 2011. In 2017, ATAMBAEV became the first Kyrgyzstani president to step down after serving one full six-year term as required in the countrys constitution. Former prime minister and ruling Social-Democratic Party of Kyrgyzstan member Sooronbay JEENBEKOV replaced him after winning an October 2017 presidential election that was the most competitive in the countrys history, although international and local election observers noted cases of vote buying and abuse of public resources. The president holds substantial powers as head of state even though the prime minister oversees the Kyrgyzstani Government and selects most cabinet members. The president represents the country internationally and can sign or veto laws, call for new elections, and nominate Supreme Court judges, cabinet members for posts related to security or defense, and numerous other high-level positions. Continuing concerns for the Kyrgyz Republic include the trajectory of democratization, endemic corruption, a history of tense, and at times violent, interethnic relations, border security vulnerabilities, and potential terrorist threats.",
        region: "Asia",
        capital: "Bishkek",
        "birth rate": 20.6,
        "death rate": 6.3,
        "population growth": 0.96,
        "labor force": 2841000,
        population: 5964897,
        "median age": 27.3,
        "GDP(PPP)": 23150000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/KG-flag.gif"
    },
    {
        id: "LA",
        name: "Laos",
        background: "Modern-day Laos has its roots in the ancient Lao kingdom of Lan Xang, established in the 14th century under King FA NGUM. For 300 years Lan Xang had influence reaching into present-day Cambodia and Thailand, as well as over all of what is now Laos. After centuries of gradual decline, Laos came under the domination of Siam (Thailand) from the late 18th century until the late 19th century, when it became part of French Indochina. The Franco-Siamese Treaty of 1907 defined the current Lao border with Thailand. In 1975, the communist Pathet Lao took control of the government, ending a six-century-old monarchy and instituting a strict socialist regime closely aligned to Vietnam. A gradual, limited return to private enterprise and the liberalization of foreign investment laws began in 1988. Laos became a member of ASEAN in 1997 and the WTO in 2013.",
        region: "Asia",
        capital: "Vientiane",
        "birth rate": 22.4,
        "death rate": 7.2,
        "population growth": 1.44,
        "labor force": 3582000,
        population: 7447396,
        "median age": 24,
        "GDP(PPP)": 49340000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LA-flag.gif"
    },
    {
        id: "LV",
        name: "Latvia",
        background: "Several eastern Baltic tribes merged in medieval times to form the ethnic core of the Latvian people (ca. 8th-12th centuries A.D.). The region subsequently came under the control of Germans, Poles, Swedes, and finally, Russians. A Latvian republic emerged following World War I, but it was annexed by the USSR in 1940 - an action never recognized by the US and many other countries. Latvia reestablished its independence in 1991 following the breakup of the Soviet Union. Although the last Russian troops left in 1994, the status of the Russian minority (some 26% of the population) remains of concern to Moscow. Latvia acceded to both NATO and the EU in the spring of 2004; it joined the euro zone in 2014 and the OECD in 2016. A dual citizenship law was adopted in 2013, easing naturalization for non-citizen children.",
        region: "Europe",
        capital: "Riga",
        "birth rate": 9.2,
        "death rate": 14.6,
        "population growth": -1.12,
        "labor force": 990000,
        population: 1881232,
        "median age": 44.4,
        "GDP(PPP)": 54020000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LG-flag.gif"
    },
    {
        id: "LB",
        name: "Lebanon",
        background: "Following World War I, France acquired a mandate over the northern portion of the former Ottoman Empire province of Syria. The French demarcated the region of Lebanon in 1920 and granted this area independence in 1943. Since independence, the country has been marked by periods of political turmoil interspersed with prosperity built on its position as a regional center for finance and trade. The country's 1975-90 civil war, which resulted in an estimated 120,000 fatalities, was followed by years of social and political instability. Sectarianism is a key element of Lebanese political life. Neighboring Syria has historically influenced Lebanon's foreign policy and internal policies, and its military occupied Lebanon from 1976 until 2005. The Lebanon-based Hizballah militia and Israel continued attacks and counterattacks against each other after Syria's withdrawal, and fought a brief war in 2006. Lebanon's borders with Syria and Israel remain unresolved.",
        region: "Middle East",
        capital: "Beirut",
        "birth rate": 13.6,
        "death rate": 5.4,
        "population growth": -6.68,
        "labor force": 2166000,
        population: 5469612,
        "median age": 33.7,
        "GDP(PPP)": 88250000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LE-flag.gif"
    },
    {
        id: "LS",
        name: "Lesotho",
        background: "Basutoland was renamed the Kingdom of Lesotho upon independence from the UK in 1966. The Basotho National Party ruled the country during its first two decades. King MOSHOESHOE II was exiled in 1990, but returned to Lesotho in 1992 and was reinstated in 1995 and subsequently succeeded by his son, King LETSIE III, in 1996. Constitutional government was restored in 1993 after seven years of military rule. In 1998, violent protests and a military mutiny following a contentious election prompted a brief but bloody intervention by South African and Botswana military forces under the aegis of the Southern African Development Community. Subsequent constitutional reforms restored relative political stability. Peaceful parliamentary elections were held in 2002, but the National Assembly elections in 2007 were hotly contested and aggrieved parties disputed how the electoral law was applied to award proportional seats in the Assembly. In 2012, competitive elections involving 18 parties saw Prime Minister Motsoahae Thomas THABANE form a coalition government - the first in the country's history - that ousted the 14-year incumbent, Pakalitha MOSISILI, who peacefully transferred power the following month. MOSISILI returned to power in snap elections in February 2015 after the collapse of THABANEs coalition government and an alleged attempted military coup. In June 2017, THABANE returned to become prime minister.",
        region: "Africa",
        capital: "Maseru",
        "birth rate": 23.2,
        "death rate": 15.4,
        "population growth": 0.16,
        "labor force": 930800,
        population: 1969334,
        "median age": 24.7,
        "GDP(PPP)": 6656000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LT-flag.gif"
    },
    {
        id: "LR",
        name: "Liberia",
        background: "Settlement of freed slaves from the US in what is today Liberia began in 1822; by 1847, the Americo-Liberians were able to establish a republic. William TUBMAN, president from 1944-71, did much to promote foreign investment and to bridge the economic, social, and political gaps between the descendants of the original settlers and the inhabitants of the interior. In 1980, a military coup led by Samuel DOE ushered in a decade of authoritarian rule. In December 1989, Charles TAYLOR launched a rebellion against DOE's regime that led to a prolonged civil war in which DOE was killed. A period of relative peace in 1997 allowed for an election that brought TAYLOR to power, but major fighting resumed in 2000. An August 2003 peace agreement ended the war and prompted the resignation of former president Charles TAYLOR, who was convicted by the UN-backed Special Court for Sierra Leone in The Hague for his involvement in Sierra Leone's civil war. After two years of rule by a transitional government, democratic elections in late 2005 brought President Ellen JOHNSON SIRLEAF to power. She subsequently won reelection in 2011 but was challenged to rebuild Liberia's economy, particularly following the 2014-15 Ebola epidemic, and to reconcile a nation still recovering from 14 years of fighting. Constitutional term limits barred President JOHNSON SIRLEAF from running for re-election. Legal challenges delayed the 2017 presidential runoff election, which was eventually won by George WEAH. In March 2018, the UN completed its 15-year peacekeeping mission in Liberia.",
        region: "Africa",
        capital: "Monrovia",
        "birth rate": 37.3,
        "death rate": 7,
        "population growth": 2.71,
        "labor force": 1677000,
        population: 5073296,
        "median age": 18,
        "GDP(PPP)": 6112000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LI-flag.gif"
    },
    {
        id: "LY",
        name: "Libya",
        background: "The Italians supplanted the Ottoman Turks in the area around Tripoli in 1911 and did not relinquish their hold until 1943 when they were defeated in World War II. Libya then passed to UN administration and achieved independence in 1951. Following a 1969 military coup, Col. Muammar al-QADHAFI assumed leadership and began to espouse his political system at home, which was a combination of socialism and Islam. During the 1970s, QADHAFI used oil revenues to promote his ideology outside Libya, supporting subversive and terrorist activities that included the downing of two airliners - one over Scotland, another in Northern Africa - and a discotheque bombing in Berlin. UN sanctions in 1992 isolated QADHAFI politically and economically following the attacks; sanctions were lifted in 2003 following Libyan acceptance of responsibility for the bombings and agreement to claimant compensation. QADHAFI also agreed to end Libya's program to develop weapons of mass destruction, and he made significant strides in normalizing relations with Western nations.Unrest that began in several Middle Eastern and North African countries in late 2010 erupted in Libyan cities in early 2011. QADHAFI's brutal crackdown on protesters spawned a civil war that triggered UN authorization of air and naval intervention by the international community. After months of seesaw fighting between government and opposition forces, the QADHAFI regime was toppled in mid-2011 and replaced by a transitional government known as the National Transitional Council (NTC). In 2012, the NTC handed power to an elected parliament, the General National Congress (GNC). Voters chose a new parliament to replace the GNC in June 2014 - the House of Representatives (HoR), which relocated to the eastern city of Tobruk after fighting broke out in Tripoli and Benghazi in July 2014.In December 2015, the UN brokered an agreement among a broad array of Libyan political parties and social groups - known as the Libyan Political Agreement (LPA). Members of the Libyan Political Dialogue, including representatives of the HoR and GNC, signed the LPA in December 2015. The LPA called for the formation of an interim Government of National Accord or GNA, with a nine-member Presidency Council, the HoR, and an advisory High Council of State that most ex-GNC members joined. The LPAs roadmap for a transition to a new constitution and elected government was subsequently endorsed by UN Security Council Resolution 2259, which also called upon member states to cease official contact with parallel institutions. In January 2016, the HoR voted to approve the LPA, including the Presidency Council, while voting against a controversial provision on security leadership positions and the Presidency Councils proposed cabinet of ministers. In March 2016, the GNA Presidency Council seated itself in Tripoli. In 2016, the GNA twice announced a slate of ministers who operate in an acting capacity, but the HoR did not endorse the ministerial list. The HoR and defunct-GNC-affiliated political hardliners continued to oppose the GNA and hamper the LPAs implementation. In September 2017, UN Special Representative Ghassan SALAME announced a new roadmap for national political reconciliation. SALAMEs plan called for amendments to the LPA, a national conference of Libyan leaders, and a constitutional referendum and general elections. In November 2018, the international partners supported SALAMEs recalibrated Action Plan for Libya that aimed to break the political deadlock by holding a National Conference in Libya in 2019 on a timeline for political transition. The National Conference was delayed following a failure of the parties to implement an agreement mediated by SALAME in Abu Dhabi on February 27, and the subsequent military action by Khalifa HAFTARs Libyan National Army against GNA forces in Tripoli that began in April 2019.",
        region: "Africa",
        capital: "Tripoli",
        "birth rate": 23,
        "death rate": 3.5,
        "population growth": 1.94,
        "labor force": 1114000,
        population: 6890535,
        "median age": 25.8,
        "GDP(PPP)": 61970000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LY-flag.gif"
    },
    {
        id: "LI",
        name: "Liechtenstein",
        background: "The Principality of Liechtenstein was established within the Holy Roman Empire in 1719. Occupied by both French and Russian troops during the Napoleonic Wars, it became a sovereign state in 1806 and joined the German Confederation in 1815. Liechtenstein became fully independent in 1866 when the Confederation dissolved. Until the end of World War I, it was closely tied to Austria, but the economic devastation caused by that conflict forced Liechtenstein to enter into a customs and monetary union with Switzerland. Since World War II (in which Liechtenstein remained neutral), the country's low taxes have spurred outstanding economic growth. In 2000, shortcomings in banking regulatory oversight resulted in concerns about the use of financial institutions for money laundering. However, Liechtenstein implemented anti-money laundering legislation and a Mutual Legal Assistance Treaty with the US that went into effect in 2003.",
        region: "Europe",
        capital: "Vaduz",
        "birth rate": 10.4,
        "death rate": 7.8,
        "population growth": 0.75,
        "labor force": 38520,
        population: 39137,
        "median age": 43.7,
        "GDP(PPP)": 4978000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LS-flag.gif"
    },
    {
        id: "LT",
        name: "Lithuania",
        background: "Lithuanian lands were united under MINDAUGAS in 1236; over the next century, through alliances and conquest, Lithuania extended its territory to include most of present-day Belarus and Ukraine. By the end of the 14th century Lithuania was the largest state in Europe. An alliance with Poland in 1386 led the two countries into a union through the person of a common ruler. In 1569, Lithuania and Poland formally united into a single dual state, the Polish-Lithuanian Commonwealth. This entity survived until 1795 when its remnants were partitioned by surrounding countries. Lithuania regained its independence following World War I but was annexed by the USSR in 1940 - an action never recognized by the US and many other countries. On 11 March 1990, Lithuania became the first of the Soviet republics to declare its independence, but Moscow did not recognize this proclamation until September of 1991 (following the abortive coup in Moscow). The last Russian troops withdrew in 1993. Lithuania subsequently restructured its economy for integration into Western European institutions; it joined both NATO and the EU in the spring of 2004. In 2015, Lithuania joined the euro zone, and it joined the Organization for Economic Cooperation and Development in 2018.",
        region: "Europe",
        capital: "Vilnius",
        "birth rate": 9.5,
        "death rate": 15,
        "population growth": -1.13,
        "labor force": 1467000,
        population: 2731464,
        "median age": 44.5,
        "GDP(PPP)": 91470000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LH-flag.gif"
    },
    {
        id: "LU",
        name: "Luxembourg",
        background: "Founded in 963, Luxembourg became a grand duchy in 1815 and an independent state under the Netherlands. It lost more than half of its territory to Belgium in 1839 but gained a larger measure of autonomy. In 1867, Luxembourg attained full independence under the condition that it promise perpetual neutrality. Overrun by Germany in both world wars, it ended its neutrality in 1948 when it entered into the Benelux Customs Union and when it joined NATO the following year. In 1957, Luxembourg became one of the six founding countries of the EEC (later the EU), and in 1999 it joined the euro currency zone.",
        region: "Europe",
        capital: "Luxembourg",
        "birth rate": 11.6,
        "death rate": 7.3,
        "population growth": 1.8,
        "labor force": 282800,
        population: 628381,
        "median age": 39.5,
        "GDP(PPP)": 62110000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LU-flag.gif"
    },
    {
        id: "MO",
        name: "Macau",
        background: 'Colonized by the Portuguese in the 16th century, Macau was the first European settlement in the Far East. Pursuant to an agreement signed by China and Portugal on 13 April 1987, Macau became the Macau Special Administrative Region of the People\'s Republic of China on 20 December 1999. In this agreement, China promised that, under its "one country, two systems" formula, China\'s political and economic system would not be imposed on Macau, and that Macau would enjoy a "high degree of autonomy" in all matters except foreign affairs and defense for the subsequent 50 years.',
        region: "Asia",
        capital: "Macau",
        "birth rate": 7.9,
        "death rate": 4.9,
        "population growth": 0.64,
        "labor force": 400000,
        population: 614458,
        "median age": 40.8,
        "GDP(PPP)": 77330000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MC-flag.gif"
    },
    {
        id: "MG",
        name: "Madagascar",
        background: "Madagascar was one of the last major habitable landmasses on earth settled by humans. While there is some evidence of human presence on the island in the millennia B.C., large-scale settlement began between A.D. 350 and 550 with settlers from present-day Indonesia. The island attracted Arab and Persian traders as early as the 7th century, and migrants from Africa arrived around A.D. 1000. Madagascar was a pirate stronghold during the late 17th and early 18th centuries, and served as a slave trading center into the 19th century. From the 16th to the late 19th century, a native Merina Kingdom dominated much of Madagascar. The island was conquered by the French in 1896 who made it a colony; independence was regained in 1960. During 1992-93, free presidential and National Assembly elections were held ending 17 years of single-party rule. In 1997, in the second presidential race, Didier RATSIRAKA, the leader during the 1970s and 1980s, returned to the presidency. The 2001 presidential election was contested between the followers of Didier RATSIRAKA and Marc RAVALOMANANA, nearly causing secession of half of the country. In 2002, the High Constitutional Court announced RAVALOMANANA the winner. RAVALOMANANA won a second term in 2006 but, following protests in 2009, handed over power to the military, which then conferred the presidency on the mayor of Antananarivo, Andry RAJOELINA, in what amounted to a coup d'etat. Following a lengthy mediation process led by the Southern African Development Community, Madagascar held UN-supported presidential and parliamentary elections in 2013. Former de facto finance minister Hery RAJAONARIMAMPIANINA won a runoff election in December 2013 and was inaugurated in January 2014. In January 2019, RAJOELINA was declared the winner of a runoff election against RAVALOMANANA; both RATSIRAKA and RAJAONARIMAMPIANINA also ran in the first round of the election, which took place in November 2018.",
        region: "Africa",
        capital: "Antananarivo",
        "birth rate": 29.9,
        "death rate": 6.2,
        "population growth": 2.39,
        "labor force": 13400000,
        population: 26955737,
        "median age": 20.3,
        "GDP(PPP)": 39850000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MA-flag.gif"
    },
    {
        id: "MW",
        name: "Malawi",
        background: "Established in 1891, the British protectorate of Nyasaland became the independent nation of Malawi in 1964. After three decades of one-party rule under President Hastings Kamuzu BANDA, the country held multiparty presidential and parliamentary elections in 1994, under a provisional constitution that came into full effect the following year. Bakili MULUZI became the first freely elected president of Malawi when he won the presidency in 1994; he won re-election in 1999. President Bingu wa MUTHARIKA, elected in 2004 after a failed attempt by the previous president to amend the constitution to permit another term, struggled to assert his authority against his predecessor and subsequently started his own party, the Democratic Progressive Party in 2005. MUTHARIKA was reelected to a second term in 2009. He oversaw some economic improvement in his first term, but was accused of economic mismanagement and poor governance in his second term. He died abruptly in 2012 and was succeeded by vice president, Joyce BANDA, who had earlier started her own party, the People's Party. MUTHARIKA's brother, Peter MUTHARIKA, defeated BANDA in the 2014 election.Peter MUTHARIKA was reelected in a disputed 2019 election that resulted in countrywide protests. Population growth, increasing pressure on agricultural lands, corruption, and the scourge of HIV/AIDS pose major problems for Malawi.",
        region: "Africa",
        capital: "Lilongwe",
        "birth rate": 40.1,
        "death rate": 7.2,
        "population growth": 3.3,
        "labor force": 7000000,
        population: 21196629,
        "median age": 16.8,
        "GDP(PPP)": 22420000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MI-flag.gif"
    },
    {
        id: "MY",
        name: "Malaysia",
        background: "During the late 18th and 19th centuries, Great Britain established colonies and protectorates in the area of current Malaysia; these were occupied by Japan from 1942 to 1945. In 1948, the British-ruled territories on the Malay Peninsula except Singapore formed the Federation of Malaya, which became independent in 1957. Malaysia was formed in 1963 when the former British colonies of Singapore, as well as Sabah and Sarawak on the northern coast of Borneo, joined the Federation. The first several years of the country's independence were marred by a communist insurgency, Indonesian confrontation with Malaysia, Philippine claims to Sabah, and Singapore's withdrawal in 1965. During the 22-year term of Prime Minister MAHATHIR Mohamad (1981-2003), Malaysia was successful in diversifying its economy from dependence on exports of raw materials to the development of manufacturing, services, and tourism. Prime Minister MAHATHIR and a newly-formed coalition of opposition parties defeated Prime Minister Mohamed NAJIB bin Abdul Razak's United Malays National Organization (UMNO) in May 2018, ending over 60 years of uninterrupted rule by UMNO.",
        region: "Asia",
        capital: "Kuala Lumpur",
        "birth rate": 18.3,
        "death rate": 5.3,
        "population growth": 1.29,
        "labor force": 14940000,
        population: 32652083,
        "median age": 29.2,
        "GDP(PPP)": 933300000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MY-flag.gif"
    },
    {
        id: "MV",
        name: "Maldives",
        background: "A sultanate since the 12th century, the Maldives became a British protectorate in 1887. The islands became a republic in 1968, three years after independence. President Maumoon Abdul GAYOOM dominated Maldives' political scene for 30 years, elected to six successive terms by single-party referendums. Following political demonstrations in the capital Male in August 2003, GAYOOM and his government pledged to embark upon a process of liberalization and democratic reforms, including a more representative political system and expanded political freedoms. Political parties were legalized in 2005.In June 2008, a constituent assembly - termed the \"Special Majlis\" - finalized a new constitution ratified by GAYOOM in August 2008. The first-ever presidential elections under a multi-candidate, multi-party system were held in October 2008. GAYOOM was defeated in a runoff poll by Mohamed NASHEED, a political activist who had been jailed several years earlier by the GAYOOM regime. In early February 2012, after several weeks of street protests in response to his ordering the arrest of a top judge, NASHEED purportedly resigned the presidency and handed over power to Vice President Mohammed WAHEED Hassan Maniku. A government-appointed Commission of National Inquiry concluded there was no evidence of a coup, but NASHEED contends that police and military personnel forced him to resign. NASHEED, WAHEED, and Abdulla YAMEEN Abdul Gayoom ran in the 2013 elections with YAMEEN ultimately winning the presidency after three rounds of voting. As president, YAMEEN weakened democratic institutions, curtailed civil liberties, jailed his political opponents, restricted the press, and exerted control over the judiciary to strengthen his hold on power and limit dissent. In September 2018, YAMEEN lost his reelection bid to Ibrahim Mohamed SOLIH, a parliamentarian of the Maldivian Democratic Party (MDP), who had the support of a coalition of four parties that came together to defeat YAMEEN and restore democratic norms to Maldives. In April 2019, SOLIH's MDP won 65 of 87 seats in parliament.",
        region: "Asia",
        capital: "Male",
        "birth rate": 16,
        "death rate": 4.1,
        "population growth": -0.08,
        "labor force": 222200,
        population: 391904,
        "median age": 29.5,
        "GDP(PPP)": 6901000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MV-flag.gif"
    },
    {
        id: "ML",
        name: "Mali",
        background: "The Sudanese Republic and Senegal became independent of France in 1960 as the Mali Federation. When Senegal withdrew after only a few months, what formerly made up the Sudanese Republic was renamed Mali. Rule by dictatorship was brought to a close in 1991 by a military coup that ushered in a period of democratic rule. President Alpha Oumar KONARE won Mali's first two democratic presidential elections in 1992 and 1997. In keeping with Mali's two-term constitutional limit, he stepped down in 2002 and was succeeded by Amadou Toumani TOURE, who was elected to a second term in a 2007 election that was widely judged to be free and fair. Malian returnees from Libya in 2011 exacerbated tensions in northern Mali, and Tuareg ethnic militias rebelled in January 2012. Low- and mid-level soldiers, frustrated with the poor handling of the rebellion, overthrew TOURE on 22 March. Intensive mediation efforts led by the Economic Community of West African States (ECOWAS) returned power to a civilian administration in April with the appointment of Interim President Dioncounda TRAORE.The post-coup chaos led to rebels expelling the Malian military from the country's three northern regions and allowed Islamic militants to set up strongholds. Hundreds of thousands of northern Malians fled the violence to southern Mali and neighboring countries, exacerbating regional food shortages in host communities. A French-led international military intervention to retake the three northern regions began in January 2013 and within a month, most of the north had been retaken. In a democratic presidential election conducted in July and August of 2013, Ibrahim Boubacar KEITA was elected president. The Malian Government and northern armed groups signed an internationally mediated peace accord in June 2015, however, the parties to the peace accord have made little progress in the accord's implementation, despite a June 2017 target for its completion. Furthermore, extremist groups outside the peace process made steady inroads into rural areas of central Mali following the consolidation of three major terrorist organizations in March 2017. In central and northern Mali, terrorist groups have exploited age-old ethnic rivalries between pastoralists and sedentary communities and inflicted serious losses on the Malian military. Intercommunal violence incidents such as targeted killings occur with increasing regularity. KEITA was reelected president in 2018 in an election that was deemed credible by international observers, despite some security and logistic shortfalls.",
        region: "Africa",
        capital: "Bamako",
        "birth rate": 42.2,
        "death rate": 9,
        "population growth": 2.95,
        "labor force": 6447000,
        population: 19553397,
        "median age": 16,
        "GDP(PPP)": 41220000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/ML-flag.gif"
    },
    {
        id: "MT",
        name: "Malta",
        background: "With a civilization that dates back thousands of years, Malta boasts some of the oldest megalithic sites in the world. Situated in the center of the Mediterranean, Maltas islands have long served as a strategic military asset, with the islands at various times having come under control of the Phoenicians, Carthaginians, Greeks, Romans,Byzantines, Moors, Normans, Sicilians, Spanish, Knights of St. John, and the French. Most recently a British colony (since 1814), Malta gained its independence in 1964 and declared itself a republic ten years later. While under British rule, the island staunchly supported the UK through both world wars. Since about the mid-1980s, the island has transformed itself into a freight transshipment point, a financial center, and a tourist destination while its key industries moved toward more service-oriented activities. Malta became an EU member in May 2004 and began using the euro as currency in 2008.",
        region: "Europe",
        capital: "Valletta",
        "birth rate": 9.9,
        "death rate": 8.3,
        "population growth": 0.87,
        "labor force": 206300,
        population: 457267,
        "median age": 42.3,
        "GDP(PPP)": 19260000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MT-flag.gif"
    },
    {
        id: "MH",
        name: "Marshall Islands",
        background: "After almost four decades under US administration as the easternmost part of the UN Trust Territory of the Pacific Islands, the Marshall Islands attained independence in 1986 under a Compact of Free Association. Compensation claims continue as a result of US nuclear testing conducted on some of the atolls between 1947 and 1962 (67 tests total). The Marshall Islands hosts the US Army Kwajalein Atoll Reagan Missile Test Site, a key installation in the US missile defense network. Kwajalein also hosts one of four dedicated ground antennas that assist in the operation of the Global Positioning System (GPS) navigation system (the others are at Cape Canaveral, Florida (US), on Ascension (Saint Helena, Ascension, and Tristan da Cunha), and at Diego Garcia (British Indian Ocean Territory)).",
        region: "Oceania",
        capital: "Majuro",
        "birth rate": 22.8,
        "death rate": 4.3,
        "population growth": 1.43,
        "labor force": 10670,
        population: 77917,
        "median age": 23.8,
        "GDP(PPP)": 196000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/RM-flag.gif"
    },
    {
        id: "MR",
        name: "Mauritania",
        background: 'Independent from France in 1960, Mauritania annexed the southern third of the former Spanish Sahara (now Western Sahara) in 1976 but relinquished it after three years of raids by the Polisario guerrilla front seeking independence for the territory. Maaouya Ould Sid Ahmed TAYA seized power in a coup in 1984 and ruled Mauritania with a heavy hand for more than two decades. A series of presidential elections that he held were widely seen as flawed. A bloodless coup in August 2005 deposed President TAYA and ushered in a military council that oversaw a transition to democratic rule. Independent candidate Sidi Ould Cheikh ABDALLAHI was inaugurated in April 2007 as Mauritania\'s first freely and fairly elected president. His term ended prematurely in August 2008 when a military junta led by General Mohamed Ould Abdel AZIZ deposed him and installed a military council government. AZIZ was subsequently elected president in July 2009 and sworn in the following month. AZIZ sustained injuries from an accidental shooting by his own troops in October 2012 but has continued to maintain his authority. He was reelected in 2014 to a second and final term as president (according to the present constitution). AZIZ will be replaced through elections scheduled for June 2019. The country continues to experience ethnic tensions among three major groups: Arabic-speaking descendants of slaves (Haratines), Arabic-speaking "White Moors" (Beydane), and members of Sub-Saharan ethnic groups mostly originating in the Senegal River valley (Halpulaar, Soninke, and Wolof).Al-Qaeda in the Islamic Maghreb (AQIM) launched a series of attacks in Mauritania between 2005 and 2011, murdering American and foreign tourists and aid workers, attacking diplomatic and government facilities, and ambushing Mauritanian soldiers and gendarmes. A successful strategy against terrorism that combines dialogue with the terrorists and military actions has prevented the country from further terrorist attacks since 2011. However, AQIM and similar groups remain active in neighboring Mali and elsewhere in the Sahel region and continue to pose a threat to Mauritanians and foreign visitors.',
        region: "Africa",
        capital: "Nouakchott",
        "birth rate": 29,
        "death rate": 7.5,
        "population growth": 2.09,
        "labor force": 1437000,
        population: 4005475,
        "median age": 21,
        "GDP(PPP)": 17280000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MR-flag.gif"
    },
    {
        id: "MU",
        name: "Mauritius",
        background: "Although known to Arab and Malay sailors as early as the 10th century, Mauritius was first explored by the Portuguese in the 16th century and subsequently settled by the Dutch - who named it in honor of Prince Maurits van NASSAU - in the 17th century. The French assumed control in 1715, developing the island into an important naval base overseeing Indian Ocean trade, and establishing a plantation economy of sugar cane. The British captured the island in 1810, during the Napoleonic Wars. Mauritius remained a strategically important British naval base, and later an air station, playing an important role during World War II for anti-submarine and convoy operations, as well as the collection of signals intelligence. Independence from the UK was attained in 1968. A stable democracy with regular free elections and a positive human rights record, the country has attracted considerable foreign investment and has one of Africa's highest per capita incomes.",
        region: "Africa",
        capital: "Port Louis",
        "birth rate": 12.6,
        "death rate": 7.3,
        "population growth": 0.54,
        "labor force": 633900,
        population: 1379365,
        "median age": 36.3,
        "GDP(PPP)": 28270000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MP-flag.gif"
    },
    {
        id: "MX",
        name: "Mexico",
        background: "The site of several advanced Amerindian civilizations - including the Olmec, Toltec, Teotihuacan, Zapotec, Maya, and Aztec - Mexico was conquered and colonized by Spain in the early 16th century. Administered as the Viceroyalty of New Spain for three centuries, it achieved independence early in the 19th century. Elections held in 2000 marked the first time since the 1910 Mexican Revolution that an opposition candidate - Vicente FOX of the National Action Party (PAN) - defeated the party in government, the Institutional Revolutionary Party (PRI). He was succeeded in 2006 by another PAN candidate Felipe CALDERON, but Enrique PENA NIETO regained the presidency for the PRI in 2012. Left-leaning antiestablishment politician and former mayor of Mexico City (2000-05) Andres Manuel LOPEZ OBRADOR, from the National Regeneration Movement (MORENA), became president in December 2018.The global financial crisis in late 2008 caused a massive economic downturn in Mexico the following year, although growth returned quickly in 2010. Ongoing economic and social concerns include low real wages, high underemployment, inequitable income distribution, and few advancement opportunities for the largely indigenous population in the impoverished southern states. Since 2007, Mexico's powerful drug-trafficking organizations have engaged in bloody feuding, resulting in tens of thousands of drug-related homicides.",
        region: "North America",
        capital: "Mexico City",
        "birth rate": 17.6,
        "death rate": 5.4,
        "population growth": 1.04,
        "labor force": 54510000,
        population: 128649565,
        "median age": 29.3,
        "GDP(PPP)": 2463000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MX-flag.gif"
    },
    {
        id: "FM",
        name: "Federated States of Micronesia",
        background: "The Caroline Islands are a widely scattered archipelago in the western Pacific Ocean; they became part of a UN Trust Territory under US administration following World War II. The eastern four island groups adopted a constitution in 1979 and chose to become the Federated States of Micronesia (FSM). (The westernmost island group became Palau.) Independence came in 1986 under a Compact of Free Association (COFA) with the US, which was amended in 2004. The COFA has been a force for stability and democracy in the FSM since it came into force in 1986. Present concerns include economic uncertainty after 2023 when direct US economic assistance is scheduled to end, large-scale unemployment, overfishing, overdependence on US foreign aid, and state perceptions of inequitable allocation of US aid.As a signatory to the COFA with the US, eligible Micronesians can live, work, and study in any part of the US and its territories without a visa - this privilege reduces stresses on the island economy and the environment. Micronesians serve in the US armed forces and military recruiting from the Federated States of Micronesia, per capita, is higher than many US states.",
        region: "Oceania",
        capital: "Palikir",
        "birth rate": 18.9,
        "death rate": 4.3,
        "population growth": -0.6,
        "labor force": 37920,
        population: 102436,
        "median age": 26.3,
        "GDP(PPP)": 348000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/FM-flag.gif"
    },
    {
        id: "MD",
        name: "Moldova",
        background: "A large portion of present day Moldovan territory became a province of the Russian Empire in 1812 and then unified with Romania in 1918 in the aftermath of World War I. This territory was then incorporated into the Soviet Union at the close of World War II. Although Moldova has been independent from the Soviet Union since 1991, Russian forces have remained on Moldovan territory east of the Nistru River in the breakaway region of Transnistria, whose population is roughly equally composed of ethnic Ukrainians, Russians, and Moldovans.Years of Communist Party rule in Moldova from 2001-2009 ultimately ended with election-related violent protests and a rerun of parliamentary elections in 2009. Since then, a series of pro-European ruling coalitions have governed Moldova. As a result of the country's most recent legislative election in February 2019, parliamentary seats are split among the left-leaning Socialist Party (35 seats), the former ruling Democratic Party (30 seats), and the center-right ACUM bloc (26 seats). Parliament voted in Prime Minister Ion CHICU and his cabinet on 14 November 2019, two days after voting to remove his predecessor, ACUM co-leader Maia SANDU, who had been in office since June 2019.",
        region: "Europe",
        capital: "Chisinauin Moldovan",
        "birth rate": 10.7,
        "death rate": 12.6,
        "population growth": -1.08,
        "labor force": 1295000,
        population: 3364496,
        "median age": 37.7,
        "GDP(PPP)": 23720000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MD-flag.gif"
    },
    {
        id: "MC",
        name: "Monaco",
        background: "The Genoese built a fortress on the site of present day Monaco in 1215. The current ruling GRIMALDI family first seized control in 1297 but was not able to permanently secure its holding until 1419. Economic development was spurred in the late 19th century with a railroad linkup to France and the opening of a casino. Since then, the principality's mild climate, splendid scenery, and gambling facilities have made Monaco world famous as a tourist and recreation center.",
        region: "Europe",
        capital: "Monaco",
        "birth rate": 6.4,
        "death rate": 10.8,
        "population growth": 0.37,
        "labor force": 52000,
        population: 39000,
        "median age": 55.4,
        "GDP(PPP)": 7672000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MN-flag.gif"
    },
    {
        id: "MN",
        name: "Mongolia",
        background: "The Mongols gained fame in the 13th century when under Chinggis KHAAN they established a huge Eurasian empire through conquest. After his death the empire was divided into several powerful Mongol states, but these broke apart in the 14th century. The Mongols eventually retired to their original steppe homelands and in the late 17th century came under Chinese rule. Mongolia declared its independence from the Manchu-led Qing Empire in 1911 and achieved limited autonomy until 1919, when it again came under Chinese control. The Mongolian Revolution of 1921 ended Chinese dominance, and a communist regime, the Mongolian Peoples Republic, took power in 1924.The modern country of Mongolia, represents only part of the Mongols' historical homeland; today, more ethnic Mongolians live in the Inner Mongolia Autonomous Region in the People's Republic of China than in Mongolia. Since the country's peaceful democratic revolution in 1990, the ex-communist Mongolian People's Revolutionary Party (MPRP) - which took the name Mongolian Peoples Party (MPP) in 2010 - has competed for political power with the Democratic Party (DP) and several other smaller parties, including a new party formed by former President ENKHBAYAR, which confusingly adopted for itself the MPRP name. In the country's most recent parliamentary elections in June 2016, Mongolians handed the MPP overwhelming control of Parliament, largely pushing out the DP, which had overseen a sharp decline in Mongolias economy during its control of Parliament in the preceding years. Mongolians elected a DP member, Khaltmaa BATTULGA, as president in 2017.",
        region: "Asia",
        capital: "Ulaanbaatar",
        "birth rate": 16.6,
        "death rate": 6.3,
        "population growth": 0.99,
        "labor force": 1241000,
        population: 3168026,
        "median age": 29.8,
        "GDP(PPP)": 43540000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MG-flag.gif"
    },
    {
        id: "ME",
        name: "Montenegro",
        background: "The use of the name Crna Gora or Black Mountain (Montenegro) began in the 13th century in reference to a highland region in the Serbian province of Zeta. The later medieval state of Zeta maintained its existence until 1496 when Montenegro finally fell under Ottoman rule. Over subsequent centuries, Montenegro managed to maintain a level of autonomy within the Ottoman Empire. From the 16th to 19th centuries, Montenegro was a theocracy ruled by a series of bishop princes; in 1852, it transformed into a secular principality. Montenegro was recognized as an independent sovereign principality at the Congress of Berlin in 1878. After World War I, during which Montenegro fought on the side of the Allies, Montenegro was absorbed by the Kingdom of Serbs, Croats, and Slovenes, which became the Kingdom of Yugoslavia in 1929. At the conclusion of World War II, it became a constituent republic of the Socialist Federal Republic of Yugoslavia. When the latter dissolved in 1992, Montenegro joined with Serbia, creating the Federal Republic of Yugoslavia and, after 2003, shifting to a looser State Union of Serbia and Montenegro. In May 2006, Montenegro invoked its right under the Constitutional Charter of Serbia and Montenegro to hold a referendum on independence from the two-state union. The vote for severing ties with Serbia barely exceeded 55% - the threshold set by the EU - allowing Montenegro to formally restore its independence on 3 June 2006. In 2017, Montenegro joined NATO and is currently completing its EU accession process, having officially applied to join the EU in December 2008.",
        region: "Europe",
        capital: "Podgorica",
        "birth rate": 11.5,
        "death rate": 10.4,
        "population growth": -0.37,
        "labor force": 273200,
        population: 609859,
        "median age": 39.6,
        "GDP(PPP)": 11080000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MJ-flag.gif"
    },
    {
        id: "MS",
        name: "Montserrat",
        background: "English and Irish colonists from St. Kitts first settled on Montserrat in 1632; the first African slaves arrived three decades later. The British and French fought for possession of the island for most of the 18th century, but it finally was confirmed as a British possession in 1783. The island's sugar plantation economy was converted to small farm landholdings in the mid-19th century. Much of this island was devastated and two-thirds of the population fled abroad because of the eruption of the Soufriere Hills Volcano that began on 18 July 1995. Montserrat has endured volcanic activity since, with the last eruption occurring in 2013.",
        region: "Central America & The Caribbean",
        capital: "Plymouth",
        "birth rate": 11.7,
        "death rate": 6,
        "population growth": 0.58,
        "labor force": 4521,
        population: 5373,
        "median age": 34.8,
        "GDP(PPP)": 167400000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MH-flag.gif"
    },
    {
        id: "MA",
        name: "Morocco",
        background: "In 788, about a century after the Arab conquest of North Africa, a series of Moroccan Muslim dynasties began to rule in Morocco. In the 16th century, the Sa'adi monarchy, particularly under Ahmad al-MANSUR (1578-1603), repelled foreign invaders and inaugurated a golden age. The Alaouite Dynasty, to which the current Moroccan royal family belongs, dates from the 17th century. In 1860, Spain occupied northern Morocco and ushered in a half-century of trade rivalry among European powers that saw Morocco's sovereignty steadily erode; in 1912, the French imposed a protectorate over the country. A protracted independence struggle with France ended successfully in 1956. The internationalized city of Tangier and most Spanish possessions were turned over to the new country that same year. Sultan MOHAMMED V, the current monarch's grandfather, organized the new state as a constitutional monarchy and in 1957 assumed the title of king. Since Spain's 1976 withdrawal from what is today called Western Sahara, Morocco has extended its de facto administrative control to roughly 75% of this territory; however, the UN does not recognize Morocco as the administering power for Western Sahara. The UN since 1991 has monitored a cease-fire between Morocco and the Polisario Front - an organization advocating the territorys independence - and restarted negotiations over the status of the territory in December 2018.King MOHAMMED VI in early 2011 responded to the spread of pro-democracy protests in the region by implementing a reform program that included a new constitution, passed by popular referendum in July 2011, under which some new powers were extended to parliament and the prime minister, but ultimate authority remains in the hands of the monarch. In November 2011, the Justice and Development Party (PJD) - a moderate Islamist party - won the largest number of seats in parliamentary elections, becoming the first Islamist party to lead the Moroccan Government. In September 2015, Morocco held its first direct elections for regional councils, one of the reforms included in the 2011 constitution. The PJD again won the largest number of seats in nationwide parliamentary elections in October 2016.",
        region: "Africa",
        capital: "Rabat",
        "birth rate": 17.9,
        "death rate": 6.6,
        "population growth": 0.96,
        "labor force": 12000000,
        population: 35561654,
        "median age": 29.1,
        "GDP(PPP)": 298600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MO-flag.gif"
    },
    {
        id: "MZ",
        name: "Mozambique",
        background: "Almost five centuries as a Portuguese colony came to a close with independence in 1975. Large-scale emigration, economic dependence on South Africa, a severe drought, and a prolonged civil war hindered the country's development until the mid-1990s. The ruling Front for the Liberation of Mozambique (FRELIMO) party formally abandoned Marxism in 1989, and a new constitution the following year provided for multiparty elections and a free market economy. A UN-negotiated peace agreement between FRELIMO and rebel Mozambique National Resistance (RENAMO) forces ended the fighting in 1992. In 2004, Mozambique underwent a delicate transition as Joaquim CHISSANO stepped down after 18 years in office. His elected successor, Armando GUEBUZA, served two terms and then passed executive power to Filipe NYUSI in 2015. RENAMOs residual armed forces intermittently engaged in a low-level insurgency after 2012, but a late December 2016 ceasefire eventually led to the two sides signing a comprehensive peace deal in August 2019. Elections in October 2019, challenged by Western observers and civil society as being problematic, resulted in resounding wins for NYUSI and FRELIMO across the country. Since October 2017, violent extremists - who an official ISIS media outlet recognized as ISIS's network in Mozambique for the first time in June 2019 - have been conducting attacks against civilians and security services in the northern province of Cabo Delgado.",
        region: "Africa",
        capital: "Maputo",
        "birth rate": 38.6,
        "death rate": 11,
        "population growth": 2.62,
        "labor force": 12900000,
        population: 30098197,
        "median age": 17,
        "GDP(PPP)": 37090000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MZ-flag.gif"
    },
    {
        id: "NA",
        name: "Namibia",
        background: "Namibia gained independence in 1990. Prior to independence, apartheid South Africa occupied the former German colony known as South-West Africa during World War I and administered it as a mandate until after World War II, when it annexed the territory. In 1966, the Marxist South-West Africa People's Organization (SWAPO) guerrilla group launched a war of independence for the area that became Namibia, but it was not until 1988 that South Africa agreed to end its administration in accordance with a UN peace plan for the entire region. Namibia has been governed by SWAPO since the country won independence, though the party has dropped much of its Marxist ideology. President Hage GEINGOB was elected in 2014 in a landslide victory, replacing Hifikepunye POHAMBA who stepped down after serving two terms. SWAPO retained its parliamentary super majority in the 2014 elections. In 2019 elections, GEINGOB was reelected but by a substantially reduced majority and SWAPO narrowly lost its super majority in parliament.",
        region: "Africa",
        capital: "Windhoek",
        "birth rate": 25.7,
        "death rate": 7.3,
        "population growth": 1.86,
        "labor force": 956800,
        population: 2630073,
        "median age": 21.8,
        "GDP(PPP)": 26600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/WA-flag.gif"
    },
    {
        id: "NR",
        name: "Nauru",
        background: "The exact origins of the Nauruans are unclear since their language does not resemble any other in the Pacific region. Germany annexed the island in 1888. A German-British consortium began mining the island's phosphate deposits early in the 20th century. Australian forces occupied Nauru in World War I; it subsequently became a League of Nations mandate. After the Second World War - and a brutal occupation by Japan - Nauru became a UN trust territory. It achieved independence in 1968 and became one of the richest countries in the world because of its extensive phosphate stocks; however, the phosphate was depleted in the early 1980s and the quality of life began to decline. In 2001, an Australian offshore refugee processing center was opened in Nauru, providing an economic lifeline. Nauru is one of Taiwan's few remaining diplomatic partners, and in 2008, Nauru recognized the breakaway Georgian republics of Abkhazia and South Ossetia.",
        region: "Oceania",
        capital: "noofficialcapital",
        "birth rate": 21.9,
        "death rate": 6,
        "population growth": 0.46,
        "labor force": 3843,
        population: 11000,
        "median age": 27,
        "GDP(PPP)": 160000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NR-flag.gif"
    },
    {
        id: "NP",
        name: "Nepal",
        background: "During the late 18th-early 19th centuries, the principality of Gorkha united many of the other principalities and states of the sub-Himalayan region into a Nepali Kingdom. Nepal retained its independence following the Anglo-Nepalese War of 1814-16 and the subsequent peace treaty laid the foundations for two centuries of amicable relations between Britain and Nepal. (The Brigade of Gurkhas continues to serve in the British Army to the present day.) In 1951, the Nepali monarch ended the century-old system of rule by hereditary premiers and instituted a cabinet system that brought political parties into the government. That arrangement lasted until 1960, when political parties were again banned, but was reinstated in 1990 with the establishment of a multiparty democracy within the framework of a constitutional monarchy.An insurgency led by Maoists broke out in 1996. During the ensuing 10-year civil war between Maoist and government forces, the monarchy dissolved the cabinet and parliament and re-assumed absolute power in 2002, after the crown prince massacred the royal family in 2001. A peace accord in 2006 led to the promulgation of an interim constitution in 2007. Following a nationwide Constituent Assembly (CA) election in 2008, the newly formed CA declared Nepal a federal democratic republic, abolished the monarchy, and elected the country's first president. After the CA failed to draft a constitution by a 2012 deadline set by the Supreme Court, then-Prime Minister Baburam BHATTARAI dissolved the CA. Months of negotiations ensued until 2013 when the major political parties agreed to create an interim government headed by then-Chief Justice Khil Raj REGMI with a mandate to hold elections for a new CA. Elections were held in 2013, in which the Nepali Congress (NC) won the largest share of seats in the CA and in 2014 formed a coalition government with the second-place Communist Party of Nepal-Unified Marxist-Leninist (UML) with NC President Sushil KOIRALA serving as prime minister. Nepal's new constitution came into effect in 2015, at which point the CA became the Parliament. Khagda Prasad Sharma OLI served as the first post-constitution prime minister from 2015 to 2016. OLI resigned ahead of a no-confidence motion against him, and Parliament elected Communist Party of Nepal-Maoist (CPN-M) leader Pushpa Kamal DAHAL (aka \"Prachanda\") prime minister. The constitution provided for a transitional period during which three sets of elections  local, provincial, and national  needed to take place. The first local elections in 20 years occurred in three phases between May and September 2017, and state and federal elections proceeded in two phases in November and December 2017. The parties headed by OLI and DAHAL ran in coalition and swept the parliamentary elections, and OLI, who led the larger of the two parties, was sworn in as prime minister in February 2018. In May 2018, OLI and DAHAL announced the merger of their parties - the UML and CPN-M - to establish the Nepal Communist Party (NCP), which is now the ruling party in Parliament.",
        region: "Asia",
        capital: "Kathmandu",
        "birth rate": 18.1,
        "death rate": 5.7,
        "population growth": 0.98,
        "labor force": 16810000,
        population: 30327877,
        "median age": 25.3,
        "GDP(PPP)": 79190000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NP-flag.gif"
    },
    {
        id: "NL",
        name: "Netherlands",
        background: 'The Dutch United Provinces declared their independence from Spain in 1579; during the 17th century, they became a leading seafaring and commercial power, with settlements and colonies around the world. After a 20-year French occupation, a Kingdom of the Netherlands was formed in 1815. In 1830, Belgium seceded and formed a separate kingdom. The Netherlands remained neutral in World War I, but suffered German invasion and occupation in World War II. A modern, industrialized nation, the Netherlands is also a large exporter of agricultural products. The country was a founding member of NATO and the EEC (now the EU) and participated in the introduction of the euro in 1999. In October 2010, the former Netherlands Antilles was dissolved and the three smallest islands - Bonaire, Sint Eustatius, and Saba - became special municipalities in the Netherlands administrative structure. The larger islands of Sint Maarten and Curacao joined the Netherlands and Aruba as constituent countries forming the Kingdom of the Netherlands.In February 2018, the Sint Eustatius island council (governing body) was dissolved and replaced by a government commissioner to restore the integrity of public administration. According to the Dutch Government, the intervention will be as "short as possible and as long as needed."',
        region: "Europe",
        capital: "Amsterdam",
        "birth rate": 11,
        "death rate": 9.2,
        "population growth": 0.37,
        "labor force": 7969000,
        population: 17280397,
        "median age": 42.8,
        "GDP(PPP)": 924400000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NL-flag.gif"
    },
    {
        id: "NC",
        name: "New Caledonia",
        background: "Settled by both Britain and France during the first half of the 19th century, the island became a French possession in 1853. It served as a penal colony for four decades after 1864. Agitation for independence during the 1980s and early 1990s ended in the 1998 Noumea Accord, which over two decades transferred an increasing amount of governing responsibility from France to New Caledonia. In a referendum held in November 2018, residents rejected independence and decided to retain their territorial status, although two additional referendums may occur in 2020 and 2022, per the NoumeaAccord.",
        region: "Oceania",
        capital: "Noumea",
        "birth rate": 14.5,
        "death rate": 5.9,
        "population growth": 1.25,
        "labor force": 119500,
        population: 290009,
        "median age": 32.9,
        "GDP(PPP)": 11110000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NC-flag.gif"
    },
    {
        id: "NZ",
        name: "New Zealand",
        background: "The Polynesian Maori reached New Zealand sometime between A.D. 1250 and 1300. In 1840, their chieftains entered into a compact with Great Britain, the Treaty of Waitangi, in which they ceded sovereignty to Queen Victoria while retaining territorial rights. That same year, the British began the first organized colonial settlement. A series of land wars between 1843 and 1872 ended with the defeat of the native peoples. The British colony of New Zealand became an independent dominion in 1907 and supported the UK militarily in both world wars. New Zealand's full participation in a number of defense alliances lapsed by the 1980s. In recent years, the government has sought to address longstanding Maori grievances.",
        region: "Oceania",
        capital: "Wellington",
        "birth rate": 12.8,
        "death rate": 6.9,
        "population growth": 1.44,
        "labor force": 2655000,
        population: 4925477,
        "median age": 37.2,
        "GDP(PPP)": 189000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NZ-flag.gif"
    },
    {
        id: "NI",
        name: "Nicaragua",
        background: "The Pacific coast of Nicaragua was settled as a Spanish colony from Panama in the early 16th century. Independence from Spain was declared in 1821 and the country became an independent republic in 1838. Britain occupied the Caribbean Coast in the first half of the 19th century, but gradually ceded control of the region in subsequent decades. Violent opposition to governmental manipulation and corruption spread to all classes by 1978 and resulted in a short-lived civil war that brought a civic-military coalition, spearheaded by the Marxist Sandinista guerrillas led by Daniel ORTEGA Saavedra to power in 1979. Nicaraguan aid to leftist rebels in El Salvador prompted the US to sponsor anti-Sandinista contra guerrillas through much of the 1980s. After losing free and fair elections in 1990, 1996, and 2001, former Sandinista President Daniel ORTEGA was elected president in 2006, 2011, and most recently in 2016. Municipal, regional, and national-level elections since 2008 have been marred by widespread irregularities. Democratic institutions have weakened under the ORTEGA administration as the president has garnered full control over all branches of government,especially after cracking down on a nationwide antigovernment protest movement in 2018.",
        region: "Central America & The Caribbean",
        capital: "Managua",
        "birth rate": 17.1,
        "death rate": 5.2,
        "population growth": 0.96,
        "labor force": 3046000,
        population: 6203441,
        "median age": 27.3,
        "GDP(PPP)": 36400000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NU-flag.gif"
    },
    {
        id: "NE",
        name: "Niger",
        background: "Niger became independent from France in 1960 and experienced single-party and military rule until 1991, when Gen. Ali SAIBOU was forced by public pressure to allow multiparty elections, which resulted in a democratic government in 1993. Political infighting brought the government to a standstill and in 1996 led to a coup by Col. Ibrahim BARE. In 1999, BARE was killed in a counter coup by military officers who restored democratic rule and held elections that brought Mamadou TANDJA to power in December of that year. TANDJA was reelected in 2004 and in 2009 spearheaded a constitutional amendment allowing him to extend his term as president. In February 2010, military officers led a coup that deposed TANDJA and suspended the constitution. ISSOUFOU Mahamadou was elected in April 2011 following the coup and reelected to a second term in early 2016. Niger is one of the poorest countries in the world with minimal government services and insufficient funds to develop its resource base, and is ranked last in the world on the United Nations Development Programmes Human Development Index. The largely agrarian and subsistence-based economy is frequently disrupted by extended droughts common to the Sahel region of Africa. The Nigerien Government continues its attempts to diversify the economy through increased oil production and mining projects. A Tuareg rebellion emerged in 2007 and ended in 2009. Niger is facing increased security concerns on its borders from various external threats including insecurity in Libya, spillover from the conflict in Mali, and violent extremism in northeastern Nigeria.",
        region: "Africa",
        capital: "Niamey",
        "birth rate": 47.5,
        "death rate": 10.2,
        "population growth": 3.66,
        "labor force": 6500000,
        population: 22772361,
        "median age": 14.8,
        "GDP(PPP)": 21860000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NG-flag.gif"
    },
    {
        id: "NG",
        name: "Nigeria",
        background: "British influence and control over what would become Nigeria and Africa's most populous country grew through the 19th century. A series of constitutions after World War II granted Nigeria greater autonomy. After independence in 1960, politics were marked by coups and mostly military rule, until the death of a military head of state in 1998 allowed for a political transition. In 1999, a new constitution was adopted and a peaceful transition to civilian government was completed. The government continues to face the daunting task of institutionalizing democracy and reforming a petroleum-based economy, whose revenues have been squandered through decades of corruption and mismanagement. In addition, Nigeria continues to experience longstanding ethnic and religious tensions. Although both the 2003 and 2007 presidential elections were marred by significant irregularities and violence, Nigeria is currently experiencing its longest period of civilian rule since independence. The general elections of 2007 marked the first civilian-to-civilian transfer of power in the country's history. National and state elections in 2011 and 2015 were generally regarded as credible. The 2015 election was also heralded for the fact that the then-umbrella opposition party, the All Progressives Congress, defeated the long-ruling People's Democratic Party that had governed since 1999, and assumed the presidency, marking the first peaceful transfer of power from one party to another. Presidential and legislative elections were held in early 2019 and deemed broadly free and fair despite voting irregularities, intimidation, and violence.",
        region: "Africa",
        capital: "Abuja",
        "birth rate": 34.6,
        "death rate": 9.1,
        "population growth": 2.53,
        "labor force": 60080000,
        population: 214028302,
        "median age": 18.6,
        "GDP(PPP)": 1121000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NI-flag.gif"
    },
    {
        id: "MK",
        name: "North Macedonia",
        background: 'North Macedonia gained its independence peacefully from Yugoslavia in 1991 under the name of "Macedonia." Greek objection to the new countrys name, insisting it implied territorial pretensions to the northern Greek province of Macedonia, and democratic backsliding for several years stalled the countrys movement toward Euro-Atlantic integration. Immediately after Macedonia declared independence, Greece sought to block Macedonian efforts to gain UN membership if the name "Macedonia" was used. The country was eventually admitted to the UN in 1993 as "The former Yugoslav Republic of Macedonia," and at the same time it agreed to UN-sponsored negotiations on the name dispute. In 1995, Greece lifted a 20-month trade embargo and the two countries agreed to normalize relations, but the issue of the name remained unresolved and negotiations for a solution continued. Over time, the US and over 130 other nations recognized Macedonia by its constitutional name, Republic of Macedonia. Ethnic Albanian grievances over perceived political and economic inequities escalated into a conflict in 2001 that eventually led to the internationally brokered Ohrid Framework Agreement, which ended the fighting and established guidelines for constitutional amendments and the creation of new laws that enhanced the rights of minorities. In January 2018, the government adopted a new law on languages, which elevated the Albanian language to an official language at the national level, with the Macedonian language remaining the sole official language in international relations. Relations between ethnic Macedonians and ethnic Albanians remain complicated, however.North Macedonia\'s pro-Western government has used its time in office since 2017 to sign a historic deal with Greece in June 2018 to end the name dispute and revive Skopje\'s NATO and EU membership prospects. This followed a nearly three-year political crisis that engulfed the country but ended in June 2017 following a six-month-long government formation period after a closely contested election in December 2016. The crisis began after the 2014 legislative and presidential election, and escalated in 2015 when the opposition party began releasing wiretapped material that revealed alleged widespread government corruption and abuse. Although an EU candidate since 2005, North Macedonia has yet to open EU accession negotiations. The country still faces challenges, including fully implementing reforms to overcome years of democratic backsliding and stimulating economic growth and development. In June 2018, Macedonia and Greece signed the Prespa Accord whereby the Republic of Macedonia agreed to change its name to the Republic of North Macedonia. Following ratification by both countries, the agreement went in to force on 12 February 2019. North Macedonia signed an accession protocol to become a NATO member state in February 2019.',
        region: "Europe",
        capital: "Skopje",
        "birth rate": 10.7,
        "death rate": 9.6,
        "population growth": 0.15,
        "labor force": 950800,
        population: 2125971,
        "median age": 39,
        "GDP(PPP)": 31030000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MK-flag.gif"
    },
    {
        id: "MP",
        name: "Northern Mariana Islands",
        background: "Under US administration as part of the UN Trust Territory of the Pacific, the people of the Northern Mariana Islands decided in the 1970s not to seek independence but instead to forge closer links with the US. Negotiations for territorial status began in 1972. A covenant to establish a commonwealth in political union with the US was approved in 1975, and came into force on 24 March 1976. A new government and constitution went into effect in 1978.",
        region: "Oceania",
        capital: "Saipan",
        "birth rate": 15.1,
        "death rate": 5.3,
        "population growth": -0.55,
        "labor force": 27970,
        population: 51433,
        "median age": 32.8,
        "GDP(PPP)": 1242000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CQ-flag.gif"
    },
    {
        id: "NO",
        name: "Norway",
        background: "Two centuries of Viking raids into Europe tapered off following the adoption of Christianity by King Olav TRYGGVASON in 994; conversion of the Norwegian kingdom occurred over the next several decades. In 1397, Norway was absorbed into a union with Denmark that lasted more than four centuries. In 1814, Norwegians resisted the cession of their country to Sweden and adopted a new constitution. Sweden then invaded Norway but agreed to let Norway keep its constitution in return for accepting the union under a Swedish king. Rising nationalism throughout the 19th century led to a 1905 referendum granting Norway independence. Although Norway remained neutral in World War I, it suffered heavy losses to its shipping. Norway proclaimed its neutrality at the outset of World War II, but was nonetheless occupied for five years by Nazi Germany (1940-45). In 1949, Norway abandoned neutrality and became a member of NATO. Discovery of oil and gas in adjacent waters in the late 1960s boosted Norway's economic fortunes. In referenda held in 1972 and 1994, Norway rejected joining the EU. Key domestic issues include immigration and integration of ethnic minorities, maintaining the country's extensive social safety net with an aging population, and preserving economic competitiveness.",
        region: "Europe",
        capital: "Oslo",
        "birth rate": 12.2,
        "death rate": 8.1,
        "population growth": 0.85,
        "labor force": 2797000,
        population: 5467439,
        "median age": 39.5,
        "GDP(PPP)": 381200000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NO-flag.gif"
    },
    {
        id: "OM",
        name: "Oman",
        background: "The inhabitants of the area of Oman have long prospered from Indian Ocean trade. In the late 18th century, the nascent sultanate in Muscat signed the first in a series of friendship treaties with Britain. Over time, Oman's dependence on British political and military advisors increased, although the sultanate never became a British colony. In 1970, QABOOS bin Said Al-Said overthrew his father, and has since ruled as sultan. Sultan QABOOS has no children and has not designated a successor publicly; the Basic Law of 1996 outlines Omans succession procedure. Sultan QABOOS extensive modernization program opened the country to the outside world, and the sultan has prioritized strategic ties with the UK and US. Oman's moderate, independent foreign policy has sought to maintain good relations with its neighbors and to avoid external entanglements.Inspired by the popular uprisings that swept the Middle East and North Africa beginning in January 2011, some Omanis staged demonstrations, calling for more jobs and economic benefits and an end to corruption. In response to those protester demands, QABOOS in 2011 pledged to implement economic and political reforms, such as granting Omans bicameral legislative body more power and authorizing direct elections for its lower house, which took place in November 2011. Additionally, the Sultan increased unemployment benefits, and, in August 2012, issued a royal directive mandating the speedy implementation of a national job creation plan for thousands of public and private sector Omani jobs. As part of the government's efforts to decentralize authority and allow greater citizen participation in local governance, Oman successfully conducted its first municipal council elections in December 2012. Announced by the sultan in 2011, the municipal councils have the power to advise the Royal Court on the needs of local districts across Oman's 11 governorates. Sultan QABOOS, Oman's longest reigning monarch, died on 11 January 2020. His cousin, HAYTHAM bin Tariq bin Taimur Al-Said, former Minister of Heritage and Culture, was sworn in as Oman's new sultan the same day.",
        region: "Middle East",
        capital: "Muscat",
        "birth rate": 23.1,
        "death rate": 3.3,
        "population growth": 1.96,
        "labor force": 2255000,
        population: 4664844,
        "median age": 26.2,
        "GDP(PPP)": 190100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/MU-flag.gif"
    },
    {
        id: "PK",
        name: "Pakistan",
        background: "The Indus Valley civilization, one of the oldest in the world and dating back at least 5,000 years, spread over much of what is presently Pakistan. During the second millennium B.C., remnants of this culture fused with the migrating Indo-Aryan peoples. The area underwent successive invasions in subsequent centuries from the Persians, Greeks, Scythians, Arabs (who brought Islam), Afghans, and Turks. The Mughal Empire flourished in the 16th and 17th centuries; the British came to dominate the region in the 18th century. The separation in 1947 of British India into the Muslim state of Pakistan (with West and East sections) and largely Hindu India was never satisfactorily resolved, and India and Pakistan fought two wars and a limited conflict - in 1947-48, 1965, and 1999 respectively - over the disputed Kashmir territory. A third war between these countries in 1971 - in which India assisted an indigenous movement reacting to the marginalization of Bengalis in Pakistani politics - resulted in East Pakistan becoming the separate nation of Bangladesh.In response to Indian nuclear weapons testing, Pakistan conducted its own tests in mid-1998. India-Pakistan relations improved in the mid-2000s but have been rocky since the November 2008 Mumbai attacks and have been further strained by attacks in India by militants believed to be based in Pakistan. Imran KHAN took office as prime minister in 2018 after the Pakistan Tehreek-e-Insaaf (PTI) party won a plurality of seats in the July 2018 general elections. Pakistan has been engaged in a decades-long armed conflict with militant groups that target government institutions and civilians, including the Tehreek-e-Taliban Pakistan (TTP) and other militant networks.",
        region: "Asia",
        capital: "Islamabad",
        "birth rate": 27.4,
        "death rate": 6.2,
        "population growth": 2.07,
        "labor force": 63890000,
        population: 233500636,
        "median age": 22,
        "GDP(PPP)": 1061000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PK-flag.gif"
    },
    {
        id: "PW",
        name: "Palau",
        background: "After three decades as part of the UN Trust Territory of the Pacific under US administration, this westernmost cluster of the Caroline Islands opted for independence in 1978 rather than join the Federated States of Micronesia. A Compact of Free Association with the US was approved in 1986 but not ratified until 1993. It entered into force the following year when the islands gained independence.",
        region: "Oceania",
        capital: "Ngerulmud",
        "birth rate": 11.3,
        "death rate": 8.3,
        "population growth": 0.39,
        "labor force": 11610,
        population: 21685,
        "median age": 33.9,
        "GDP(PPP)": 264000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PS-flag.gif"
    },
    {
        id: "PA",
        name: "Panama",
        background: "Explored and settled by the Spanish in the 16th century, Panama broke with Spain in 1821 and joined a union of Colombia, Ecuador, and Venezuela - named the Republic of Gran Colombia. When the latter dissolved in 1830, Panama remained part of Colombia. With US backing, Panama seceded from Colombia in 1903 and promptly signed a treaty with the US allowing for the construction of a canal and US sovereignty over a strip of land on either side of the structure (the Panama Canal Zone). The Panama Canal was built by the US Army Corps of Engineers between 1904 and 1914. In 1977, an agreement was signed for the complete transfer of the Canal from the US to Panama by the end of the century. Certain portions of the Zone and increasing responsibility over the Canal were turned over in the subsequent decades. With US help, dictator Manuel NORIEGA was deposed in 1989. The entire Panama Canal, the area supporting the Canal, and remaining US military bases were transferred to Panama by the end of 1999. An ambitious expansion project to more than double the Canal's capacity - by allowing for more Canal transits and larger ships - was carried out between 2007 and 2016.",
        region: "Central America & The Caribbean",
        capital: "Panama City",
        "birth rate": 17.1,
        "death rate": 5.1,
        "population growth": 1.2,
        "labor force": 1633000,
        population: 3894082,
        "median age": 30.1,
        "GDP(PPP)": 104100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PM-flag.gif"
    },
    {
        id: "PG",
        name: "Papua New Guinea",
        background: "The eastern half of the island of New Guinea - second largest in the world - was divided between Germany (north) and the UK (south) in 1885. The latter area was transferred to Australia in 1902, which occupied the northern portion during World War I and continued to administer the combined areas until independence in 1975. A nine-year secessionist revolt on the island of Bougainville ended in 1997 after claiming some 20,000 lives. Since 2001, Bougainville has experienced autonomy; a referendum asking the population if they would like independence or greaterself rule occurred in November 2019, with almost 98% of voters choosing independence.",
        region: "Oceania",
        capital: "Port Moresby",
        "birth rate": 22.5,
        "death rate": 6.7,
        "population growth": 1.6,
        "labor force": 3681000,
        population: 7259456,
        "median age": 24,
        "GDP(PPP)": 30190000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PP-flag.gif"
    },
    {
        id: "PY",
        name: "Paraguay",
        background: "Paraguay achieved its independence from Spain in 1811. In the disastrous War of the Triple Alliance (1865-70) - between Paraguay and Argentina, Brazil, and Uruguay - Paraguay lost two-thirds of its adult males and much of its territory. The country stagnated economically for the next half century. Following the Chaco War of 1932-35 with Bolivia, Paraguay gained a large part of the Chaco lowland region. The 35-year military dictatorship of Alfredo STROESSNER ended in 1989, and Paraguay has held relatively free and regular presidential elections since the country's return to democracy.",
        region: "South America",
        capital: "Asuncion",
        "birth rate": 16.6,
        "death rate": 4.9,
        "population growth": 1.16,
        "labor force": 3428000,
        population: 7191685,
        "median age": 29.7,
        "GDP(PPP)": 88910000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PA-flag.gif"
    },
    {
        id: "PE",
        name: "Peru",
        background: "Ancient Peru was the seat of several prominent Andean civilizations, most notably that of the Incas whose empire was captured by Spanish conquistadors in 1533. Peru declared its independence in 1821, and remaining Spanish forces were defeated in 1824. After a dozen years of military rule, Peru returned to democratic leadership in 1980, but experienced economic problems and the growth of a violent insurgency. President Alberto FUJIMORI's election in 1990 ushered in a decade that saw a dramatic turnaround in the economy and significant progress in curtailing guerrilla activity. Nevertheless, the president's increasing reliance on authoritarian measures and an economic slump in the late 1990s generated mounting dissatisfaction with his regime, which led to his resignation in 2000. A caretaker government oversaw a new election in the spring of 2001, which installed Alejandro TOLEDO Manrique as the new head of government - Peru's first democratically elected president of indigenous ethnicity. The presidential election of 2006 saw the return of Alan GARCIA Perez who, after a disappointing presidential term from 1985 to 1990, oversaw a robust economic rebound. Former army officer Ollanta HUMALA Tasso was elected president in June 2011, and carried on the sound, market-oriented economic policies of the three preceding administrations. Poverty and unemployment levels have fallen dramatically in the last decade, and today Peru boasts one of the best performing economies in Latin America. Pedro Pablo KUCZYNSKI Godard won a very narrow presidential runoff election in June 2016. Facing impeachment after evidence surfaced of his involvement in a vote-buying scandal, President KUCZYNSKI offered his resignation on 21 March 2018. Two days later, First Vice President Martin Alberto VIZCARRA Cornejo was sworn in as president. On 30 September 2019, President VIZCARRA invoked his constitutional authority to dissolve Peru's Congress after months of battling with the body over anticorruption reforms. New congressional elections are scheduled for 26 January 2020.",
        region: "South America",
        capital: "Lima",
        "birth rate": 17,
        "death rate": 6.2,
        "population growth": 0.92,
        "labor force": 17030000,
        population: 31914989,
        "median age": 29.1,
        "GDP(PPP)": 430300000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PE-flag.gif"
    },
    {
        id: "PH",
        name: "Philippines",
        background: 'The Philippine Islands became a Spanish colony during the 16th century; they were ceded to the US in 1898 following the Spanish-American War. In 1935 the Philippines became a self-governing commonwealth. Manuel QUEZON was elected president and was tasked with preparing the country for independence after a 10-year transition. In 1942 the islands fell under Japanese occupation during World War II, and US forces and Filipinos fought together during 1944-45 to regain control. On 4 July 1946 the Republic of the Philippines attained its independence. A 21-year rule by Ferdinand MARCOS ended in 1986, when a "people power" movement in Manila ("EDSA 1") forced him into exile and installed Corazon AQUINO as president. Her presidency was hampered by several coup attempts that prevented a return to full political stability and economic development. Fidel RAMOS was elected president in 1992. His administration was marked by increased stability and by progress on economic reforms. In 1992, the US closed its last military bases on the islands. Joseph ESTRADA was elected president in 1998. He was succeeded by his vice-president, Gloria MACAPAGAL-ARROYO, in January 2001 after ESTRADA\'s stormy impeachment trial on corruption charges broke down and another "people power" movement ("EDSA 2") demanded his resignation. MACAPAGAL-ARROYO was elected to a six-year term as president in May 2004. Her presidency was marred by several corruption allegations but the Philippine economy was one of the few to avoid contraction following the 2008 global financial crisis, expanding each year of her administration. Benigno AQUINO III was elected to a six-year term as president in May 2010 and was succeeded by Rodrigo DUTERTE in May 2016.The Philippine Government faces threats from several groups, some of which are on the US Government\'s Foreign Terrorist Organization list. Manila has waged a decades-long struggle against ethnic Moro insurgencies in the southern Philippines, which led to a peace accord with the Moro National Liberation Front and a separate agreement with a break away faction, the Moro Islamic Liberation Front. The decades-long Maoist-inspired New People\'s Army insurgency also operates through much of the country. In 2017, Philippine armed forces battled an ISIS-Philippines siege in Marawi City, driving DUTERTE to declare martial law in the region. The Philippines faces increased tension with China over disputed territorial and maritime claims in the South China Sea.',
        region: "Asia",
        capital: "Manila",
        "birth rate": 22.9,
        "death rate": 6,
        "population growth": 1.52,
        "labor force": 42780000,
        population: 109180815,
        "median age": 24.1,
        "GDP(PPP)": 877200000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/RP-flag.gif"
    },
    {
        id: "PL",
        name: "Poland",
        background: 'Poland\'s history as a state began near the middle of the 10th century. By the mid-16th century, the Polish-Lithuanian Commonwealth ruled a vast tract of land in Central and Eastern Europe. During the 18th century, internal disorders weakened the nation, and in a series of agreements between 1772 and 1795, Russia, Prussia, and Austria partitioned Poland among themselves. Poland regained its independence in 1918 only to be overrun by Germany and the Soviet Union in World War II. It became a Soviet satellite state following the war. Labor turmoil in 1980 led to the formation of the independent trade union "Solidarity" that over time became a political force with over 10 million members. Free elections in 1989 and 1990 won Solidarity control of the parliament and the presidency, bringing the communist era to a close. A "shock therapy" program during the early 1990s enabled the country to transform its economy into one of the most robust in Central Europe. Poland joined NATO in 1999 and the EU in 2004. With its transformation to a democratic, market-oriented country largely completed and with large investments in defense, energy, and other infrastructure, Poland is an increasingly active member of Euro-Atlantic organizations.',
        region: "Europe",
        capital: "Warsaw",
        "birth rate": 8.9,
        "death rate": 10.6,
        "population growth": -0.19,
        "labor force": 17600000,
        population: 38282325,
        "median age": 41.9,
        "GDP(PPP)": 1126000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PL-flag.gif"
    },
    {
        id: "PT",
        name: "Portugal",
        background: "Following its heyday as a global maritime power during the 15th and 16th centuries, Portugal lost much of its wealth and status with the destruction of Lisbon in a 1755 earthquake, occupation during the Napoleonic Wars, and the independence of Brazil, its wealthiest colony, in 1822. A 1910 revolution deposed the monarchy, and for most of the next six decades, repressive governments ran the country. In 1974, a left-wing military coup installed broad democratic reforms. The following year, Portugal granted independence to all of its African colonies. Portugal is a founding member of NATO and entered the EC (now the EU) in 1986.",
        region: "Europe",
        capital: "Lisbon",
        "birth rate": 8.1,
        "death rate": 10.8,
        "population growth": -0.25,
        "labor force": 5233000,
        population: 10302674,
        "median age": 44.6,
        "GDP(PPP)": 314100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/PO-flag.gif"
    },
    {
        id: "PR",
        name: "Puerto Rico",
        background: "Populated for centuries by aboriginal peoples, the island was claimed by the Spanish Crown in 1493 following Christopher COLUMBUS' second voyage to the Americas. In 1898, after 400 years of colonial rule that saw the indigenous population nearly exterminated and African slave labor introduced, Puerto Rico was ceded to the US as a result of the Spanish-American War. Puerto Ricans were granted US citizenship in 1917. Popularly elected governors have served since 1948. In 1952, a constitution was enacted providing for internal self-government. In plebiscites held in 1967, 1993, and 1998, voters chose not to alter the existing political status with the US, but the results of a 2012 vote left open the possibility of American statehood. Economic recession on the island has led to a net population loss since about 2005, as large numbers of residents moved to the US mainland. The trend has accelerated since 2010; in 2014, Puerto Rico experienced a net population loss to the mainland of 64,000, more than double the net loss of 26,000 in 2010. Hurricane Maria struck the island on 20 September 2017 causing catastrophic damage, including destruction of the electrical grid that had been cripled by Hurricane Irma just two weeks before. It was the worst storm to hit the island in eight decades, and damage is estimated in the tens of billions of dollars.",
        region: "Central America & The Caribbean",
        capital: "San Juan",
        "birth rate": 8,
        "death rate": 9.5,
        "population growth": -1.59,
        "labor force": 1139000,
        population: 3189068,
        "median age": 43.6,
        "GDP(PPP)": 130000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/RQ-flag.gif"
    },
    {
        id: "QA",
        name: "Qatar",
        background: "Ruled by the Al Thani family since the mid-1800s, Qatar within the last 60 years transformed itself from a poor British protectorate noted mainly for pearling into an independent state with significant oil and natural gas revenues. Former Amir HAMAD bin Khalifa Al Thani, who overthrew his father in a bloodless coup in 1995, ushered in wide-sweeping political and media reforms, unprecedented economic investment, and a growing Qatari regional leadership role, in part through the creation of the pan-Arab satellite news network Al-Jazeera and Qatar's mediation of some regional conflicts. In the 2000s, Qatar resolved its longstanding border disputes with both Bahrain and Saudi Arabia and by 2007 had attained the highest per capita income in the world. Qatar did not experience domestic unrest or violence like that seen in other Near Eastern and North African countries in 2011, due in part to its immense wealth and patronage network. In mid-2013, HAMAD peacefully abdicated, transferring power to his son, the current Amir TAMIM bin Hamad. TAMIM is popular with the Qatari public, for his role in shepherding the country through an economic embargo by some other regional countries, for his efforts to improve the country's healthcare and education systems, and for his expansion of the country's infrastructure in anticipation of Doha's hosting of the 2022 World Cup.Recently, Qatars relationships with its neighbors have been tense, although since the fall of 2019 there have been signs of improved prospects for a thaw. Following the outbreak of regional unrest in 2011, Doha prided itself on its support for many popular revolutions, particularly in Libya and Syria. This stance was to the detriment of Qatars relations with Bahrain, Egypt, Saudi Arabia, and the United Arab Emirates (UAE), which temporarily recalled their respective ambassadors from Doha in March 2014. TAMIM later oversaw a warming of Qatars relations with Bahrain, Egypt, Saudi Arabia, and the UAE in November 2014 following Kuwaiti mediation and signing of the Riyadh Agreement. This reconciliation, however, was short-lived. In June 2017, Bahrain, Egypt, Saudi Arabia, and the UAE (the \"Quartet\") cut diplomatic and economic ties with Qatar in response to alleged violations of the agreement, among other complaints.",
        region: "Middle East",
        capital: "Doha",
        "birth rate": 9.3,
        "death rate": 1.6,
        "population growth": 1.55,
        "labor force": 1953000,
        population: 2444174,
        "median age": 33.7,
        "GDP(PPP)": 339500000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/QA-flag.gif"
    },
    {
        id: "RO",
        name: "Romania",
        background: 'The principalities of Wallachia and Moldavia - for centuries under the suzerainty of the Turkish Ottoman Empire - secured their autonomy in 1856; they were de facto linked in 1859 and formally united in 1862 under the new name of Romania. The country gained recognition of its independence in 1878. It joined the Allied Powers in World War I and acquired new territories - most notably Transylvania - following the conflict. In 1940, Romania allied with the Axis powers and participated in the 1941 German invasion of the USSR. Three years later, overrun by the Soviets, Romania signed an armistice. The post-war Soviet occupation led to the formation of a communist "people\'s republic" in 1947 and the abdication of the king. The decades-long rule of dictator Nicolae CEAUSESCU, who took power in 1965, and his Securitate police state became increasingly oppressive and draconian through the 1980s. CEAUSESCU was overthrown and executed in late 1989. Former communists dominated the government until 1996 when they were swept from power. Romania joined NATO in 2004 and the EU in 2007.',
        region: "Europe",
        capital: "Bucharest",
        "birth rate": 8.5,
        "death rate": 12,
        "population growth": -0.37,
        "labor force": 8951000,
        population: 21302893,
        "median age": 42.5,
        "GDP(PPP)": 483400000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/RO-flag.gif"
    },
    {
        id: "RU",
        name: "Russia",
        background: "Founded in the 12th century, the Principality of Muscovy was able to emerge from over 200 years of Mongol domination (13th-15th centuries) and to gradually conquer and absorb surrounding principalities. In the early 17th century, a new ROMANOV Dynasty continued this policy of expansion across Siberia to the Pacific. Under PETER I (ruled 1682-1725), hegemony was extended to the Baltic Sea and the country was renamed the Russian Empire. During the 19th century, more territorial acquisitions were made in Europe and Asia. Defeat in the Russo-Japanese War of 1904-05 contributed to the Revolution of 1905, which resulted in the formation of a parliament and other reforms. Devastating defeatsand food shortagesin World War I led to widespread rioting in the major cities of the Russian Empire and to the overthrow in 1917 of the ROMANOV Dynasty. The communists under Vladimir LENIN seized power soon after and formed the USSR. The brutal rule of Iosif STALIN (1928-53) strengthened communist rule and Russian dominance of the Soviet Union at a cost of tens of millions of lives. After defeating Germany in World War II as part of an alliance with the US (1939-1945), the USSR expanded its territory and influence in Eastern Europe and emerged as a global power. The USSR was the principal adversary of the US during the Cold War (1947-1991). The Soviet economy and society stagnated in the decades following Stalin's rule, until General Secretary Mikhail GORBACHEV (1985-91) introduced glasnost (openness) and perestroika (restructuring) in an attempt to modernize communism, but his initiatives inadvertently released forces that by December 1991led to the dissolution ofthe USSR into Russia and 14 other independent states.Following economic and political turmoil during President Boris YELTSIN's term (1991-99), Russia shifted toward a centralized authoritarian state under President Vladimir PUTIN (2000-2008, 2012-present) in which the regime seeks to legitimize its rule through managed elections, populist appeals, a foreign policy focused on enhancing the country's geopolitical influence, and commodity-based economic growth. Russia faces a largely subdued rebel movement in Chechnya and some other surrounding regions, although violence still occurs throughout the North Caucasus.",
        region: "Asia",
        capital: "Moscow",
        "birth rate": 10,
        "death rate": 13.4,
        "population growth": -0.16,
        "labor force": 76530000,
        population: 141722205,
        "median age": 40.3,
        "GDP(PPP)": 4016000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/RS-flag.gif"
    },
    {
        id: "RW",
        name: "Rwanda",
        background: "In 1959, three years before independence from Belgium, the majority ethnic group, the Hutus, overthrew the ruling Tutsi king. Over the next several years, thousands of Tutsis were killed, and some 150,000 driven into exile in neighboring countries. The children of these exiles later formed a rebel group, the Rwandan Patriotic Front (RPF), and began a civil war in 1990. The war, along with several political and economic upheavals, exacerbated ethnic tensions, culminating in April 1994 in a state-orchestrated genocide, in which Rwandans killed approximately 800,000 of their fellow citizens, including approximately three-quarters of the Tutsi population. The genocide ended later that same year when the predominantly Tutsi RPF, operating out of Uganda and northern Rwanda, defeated the national army and Hutu militias, and established an RPF-led government of national unity. Rwanda held its first local elections in 1999 and its first post-genocide presidential and legislative elections in 2003. Rwanda joined the Commonwealth in late 2009. President Paul KAGAME won the presidential election in August 2017 after changing the constitution in 2016 to allow him to run for a third term.",
        region: "Africa",
        capital: "Kigali",
        "birth rate": 27.9,
        "death rate": 6.1,
        "population growth": 2,
        "labor force": 6227000,
        population: 12712431,
        "median age": 19.7,
        "GDP(PPP)": 24680000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/RW-flag.gif"
    },
    {
        id: "SH",
        name: "Saint Helena, Ascension, and Tristan da Cunha",
        background: "Saint Helena is a British Overseas Territory consisting of Saint Helena and Ascension Islands, and the island group of Tristan da Cunha.Saint Helena: Uninhabited when first discovered by the Portuguese in 1502, Saint Helena was garrisoned by the British during the 17th century. It acquired fame as the place of Napoleon BONAPARTE's exile from 1815 until his death in 1821, but its importance as a port of call declined after the opening of the Suez Canal in 1869. During the Anglo-Boer War in South Africa, several thousand Boer prisoners were confined on the island between 1900 and 1903.;Saint Helena is one of the most remote populated places in the world. The British Government committed to building an airport on Saint Helena in 2005. After more than a decade of delays and construction, a commercial air service to South Africa via Namibia was inaugurated in October of 2017. The weekly service to Saint Helena from Johannesburg via Windhoek in Namibia takes just over six hours (including the refueling stop in Windhoek) and replaces the mail ship that had made a five-day journey to the island every three weeks.;Ascension Island: This barren and uninhabited island was discovered and named by the Portuguese in 1503. The British garrisoned the island in 1815 to prevent a rescue of Napoleon from Saint Helena. It served as a provisioning station for the Royal Navy's West Africa Squadron on anti-slavery patrol. The island remained under Admiralty control until 1922, when it became a dependency of Saint Helena. During World War II, the UK permitted the US to construct an airfield on Ascension in support of transatlantic flights to Africa and anti-submarine operations in the South Atlantic. In the 1960s the island became an important space tracking station for the US. In 1982, Ascension was an essential staging area for British forces during the Falklands War. It remains a critical refueling point in the air-bridge from the UK to the South Atlantic.;The island hosts one of four dedicated ground antennas that assist in the operation of the Global Positioning System (GPS) navigation system (the others are on Diego Garcia (British Indian Ocean Territory), Kwajalein (Marshall Islands), and at Cape Canaveral, Florida (US)). NASA and the US Air Force also operate a Meter-Class Autonomous Telescope (MCAT) on Ascension as part of the deep space surveillance system for tracking orbital debris, which can be a hazard to spacecraft and astronauts.Tristan da Cunha: The island group consists of Tristan da Cunha, Nightingale, Inaccessible, and Gough Islands. Tristan da Cunha, named after its Portuguese discoverer (1506), was garrisoned by the British in 1816 to prevent any attempt to rescue Napoleon from Saint Helena. Gough and Inaccessible Islands have been designated World Heritage Sites. South Africa leases a site for a meteorological station on Gough Island.",
        region: "Africa",
        capital: "Jamestown",
        "birth rate": 9.4,
        "death rate": 8.3,
        "population growth": 0.13,
        "labor force": 2486,
        population: 7862,
        "median age": 43.2,
        "GDP(PPP)": 31100000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SH-flag.gif"
    },
    {
        id: "KN",
        name: "Saint Kitts and Nevis",
        background: "Carib Indians occupied the islands of the West Indies for hundreds of years before the British and French began settlement in 1623. During the course of 17th century, Saint Kitts became the premier base for English and French expansion into the Caribbean. The French ceded the territory to the UK in 1713. At the turn of the 18th century, Saint Kitts was the richest British Crown Colony per capita in the Caribbean, a result of the sugar trade. Although small in size and separated by only 3 km (2 mi) of water, Saint Kitts and Nevis were viewed and governed as different states until the late-19th century, when the British forcibly unified them along with the island of Anguilla. In 1967, the island territory of Saint Christopher-Nevis-Anguilla became an associated state of the UK with full internal autonomy. The island of Anguilla rebelled and was allowed to secede in 1971. The remaining islands achieved independence in 1983 as Saint Kitts and Nevis. In 1998, a referendum on Nevis to separate from Saint Kitts fell short of the two-thirds majority vote needed.",
        region: "Central America & The Caribbean",
        capital: "Basseterre",
        "birth rate": 12.6,
        "death rate": 7.3,
        "population growth": 0.67,
        "labor force": 18170,
        population: 53821,
        "median age": 36.5,
        "GDP(PPP)": 1550000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SC-flag.gif"
    },
    {
        id: "LC",
        name: "Saint Lucia",
        background: "The island, with its fine natural harbor at Castries and burgeoning sugar industry, was contested between England and France throughout the 17th and early 18th centuries (changing possession 14 times); it was finally ceded to the UK in 1814 and became part of the British Windward Islands colony. Even after the abolition of slavery on its plantations in 1834, Saint Lucia remained an agricultural island, dedicated to producing tropical commodity crops. In the mid-20th century, Saint Lucia joined the West Indies Federation (19581962) and in 1967 became one of the six members of the West Indies Associated States, with internal self-government. In 1979, Saint Lucia gained full independence.",
        region: "Central America & The Caribbean",
        capital: "Castries",
        "birth rate": 12.5,
        "death rate": 8.1,
        "population growth": 0.29,
        "labor force": 79700,
        population: 166487,
        "median age": 36.9,
        "GDP(PPP)": 2542000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/ST-flag.gif"
    },
    {
        id: "MF",
        name: "Saint Martin",
        background: "Although sighted by Christopher COLUMBUS in 1493 and claimed for Spain, it was the Dutch who occupied the island in 1631 to exploit its salt deposits. The Spanish retook the island in 1633, but continued to be harassed by the Dutch. The Spanish finally relinquished Saint Martin to the French and Dutch, who divided it between themselves in 1648. Friction between the two sides caused the border to frequently fluctuate over the next two centuries, with the French eventually holding the greater portion of the island (about 61%). The cultivation of sugar cane introduced African slavery to the island in the late 18th century; the practice was not abolished until 1848. The island became a free port in 1939; the tourism industry was dramatically expanded during the 1970s and 1980s. In 2003, the populace of Saint Martin voted to secede from Guadeloupe and in 2007, the northern portion of the island became a French overseas collectivity. In 2010, the southern Dutch portion of the island became the independent nation of Sint Maarten within the Kingdom of the Netherlands. On 6 September 2017, Hurricane Irma passed over the island of Saint Martin causing extensive damage to roads, communications, electrical power, and housing; the UN estimated that 90% of the buildings were damaged or destroyed.",
        region: "Central America & The Caribbean",
        capital: "Marigot",
        "birth rate": 14.3,
        "death rate": 4.6,
        "population growth": 0.4,
        "labor force": 17300,
        population: 32556,
        "median age": 33.3,
        "GDP(PPP)": 561500000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/RN-flag.gif"
    },
    {
        id: "PM",
        name: "Saint Pierre and Miquelon",
        background: "First settled by the French in the early 17th century, the islands represent the sole remaining vestige of France's once vast North American possessions. They attained the status of an overseas collectivity in 2003.",
        region: "North America",
        capital: "Saint-Pierre",
        "birth rate": 6.7,
        "death rate": 10.9,
        "population growth": -1.15,
        "labor force": 4429,
        population: 5347,
        "median age": 48.5,
        "GDP(PPP)": 261300000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SB-flag.gif"
    },
    {
        id: "VC",
        name: "Saint Vincent and the Grenadines",
        background: "Resistance by native Caribs prevented colonization on Saint Vincent until 1719. Disputed between France and the UK for most of the 18th century, the island was ceded to the latter in 1783. The British prized Saint Vincent due to its fertile soil, which allowed for thriving slave-run plantations of sugar, coffee, indigo, tobacco, cotton, and cocoa. In 1834, the British abolished slavery. Immigration of indentured servants eased the ensuing labor shortage, as did subsequent Portuguese immigrants from Madeira and East Indian laborers. Conditions remained harsh for both former slaves and immigrant agricultural workers, however, as depressed world sugar prices kept the economy stagnant until the early 1900s. The economy then went into a period of decline with many landowners abandoning their estates and leaving the land to be cultivated by liberated slaves. Between 1960 and 1962, Saint Vincent and the Grenadines was a separate administrative unit of the Federation of the West Indies. Autonomy was granted in 1969 and independence in 1979.",
        region: "Central America & The Caribbean",
        capital: "Kingstown",
        "birth rate": 12.6,
        "death rate": 7.6,
        "population growth": -0.22,
        "labor force": 57520,
        population: 101390,
        "median age": 35.3,
        "GDP(PPP)": 1265000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/VC-flag.gif"
    },
    {
        id: "WS",
        name: "Samoa",
        background: 'New Zealand occupied the German protectorate of Western Samoa at the outbreak of World War I in 1914. It continued to administer the islands as a mandate and then as a trust territory until 1962, when the islands became the first Polynesian nation to reestablish independence in the 20th century. The country dropped the "Western" from its name in 1997.In the late 2000s, Samoa began making efforts to more closely align with Australia and New Zealand. In 2009, Samoa changed its driving orientation to the left side of the road, in line with other Commonwealth countries. In 2011, Samoa jumped forward one day - skipping December 30 - by moving to the west of the International Date Line so that it was one hour ahead of New Zealand and three hours ahead of the east coast of Australia, rather than 23 and 21 hours behind, respectively.',
        region: "Oceania",
        capital: "Apia",
        "birth rate": 19.6,
        "death rate": 5.4,
        "population growth": 0.61,
        "labor force": 50700,
        population: 203774,
        "median age": 25.6,
        "GDP(PPP)": 1137000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/WS-flag.gif"
    },
    {
        id: "SM",
        name: "San Marino",
        background: "Geographically the third smallest state in Europe (after the Holy See and Monaco), San Marino also claims to be the world's oldest republic. According to tradition, it was founded by a Christian stonemason named MARINUS in A.D. 301. San Marino's foreign policy is aligned with that of the EU, although it is not a member; social and political trends in the republic track closely with those of its larger neighbor, Italy.",
        region: "Europe",
        capital: "San Marino",
        "birth rate": 8.8,
        "death rate": 9,
        "population growth": 0.65,
        "labor force": 21960,
        population: 34232,
        "median age": 45.2,
        "GDP(PPP)": 2064000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SM-flag.gif"
    },
    {
        id: "ST",
        name: "Sao Tome and Principe",
        background: "Discovered and claimed by Portugal in the late 15th century, the islands' sugar-based economy gave way to coffee and cocoa in the 19th century - all grown with African plantation slave labor, a form of which lingered into the 20th century. While independence was achieved in 1975, democratic reforms were not instituted until the late 1980s. The country held its first free elections in 1991, but frequent internal wrangling between the various political parties precipitated repeated changes in leadership and four failed, non-violent coup attempts in 1995, 1998, 2003, and 2009. In 2012, three opposition parties combined in a no confidence vote to bring down the majority government of former Prime Minister Patrice TROVOADA, but in 2014, legislative elections returned him to the office. President Evaristo CARVALHO, of the same political party as Prime Minister TROVOADA, was elected in September 2016, marking a rare instance in which the positions of president and prime minister are held by the same party. Prime Minister TROVOADA resigned at the end of 2018 and was replaced by Jorge BOM JESUS. New oil discoveries in the Gulf of Guinea may attract increased attention to the small island nation.",
        region: "Africa",
        capital: "Sao Tome",
        "birth rate": 29.7,
        "death rate": 6.3,
        "population growth": 1.58,
        "labor force": 72600,
        population: 211122,
        "median age": 19.3,
        "GDP(PPP)": 686000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TP-flag.gif"
    },
    {
        id: "SA",
        name: "Saudi Arabia",
        background: "Saudi Arabia is the birthplace of Islam and home to Islam's two holiest shrines in Mecca and Medina. The king's official title is the Custodian of the Two Holy Mosques. The modern Saudi state was founded in 1932 by ABD AL-AZIZ bin Abd al-Rahman Al SAUD (Ibn Saud) after a 30-year campaign to unify most of the Arabian Peninsula. One of his male descendants rules the country today, as required by the country's 1992 Basic Law. Following Iraq's invasion of Kuwait in 1990, Saudi Arabia accepted the Kuwaiti royal family and 400,000 refugees while allowing Western and Arab troops to deploy on its soil for the liberation of Kuwait the following year. The continuing presence of foreign troops on Saudi soil after the liberation of Kuwait became a source of tension between the royal family and the public until all operational US troops left the country in 2003. Major terrorist attacks in May and November 2003 spurred a strong ongoing campaign against domestic terrorism and extremism. US troops returned to the Kingdom in October 2019 after attacks on Saudi oil infrastructure.From 2005 to 2015, King ABDALLAH bin Abd al-Aziz Al Saud incrementally modernized the Kingdom. Driven by personal ideology and political pragmatism, he introduced a series of social and economic initiatives, including expanding employment and social opportunities for women, attracting foreign investment, increasing the role of the private sector in the economy, and discouraging businesses from hiring foreign workers. These reforms have accelerated under King SALMAN bin Abd al-Aziz, who ascended to the throne in 2015, and has since lifted the Kingdom's ban on women driving and allowed cinemas to operate for the first time in decades.Saudi Arabia saw some protests during the 2011 Arab Spring but not the level of bloodshed seen in protests elsewhere in the region. Shia Muslims in the Eastern Province protested primarily against the detention of political prisoners, endemic discrimination, and Bahraini and Saudi Government actions in Bahrain. Riyadh took a cautious but firm approach by arresting some protesters but releasing most of them quickly and by using its state-sponsored clerics to counter political and Islamist activism.The government held its first-ever elections in 2005 and 2011, when Saudis went to the polls to elect municipal councilors. In December 2015, women were allowed to vote and stand as candidates for the first time in municipal council elections, with 19 women winning seats. After King SALMAN ascended to the throne in 2015, he placed the first next-generation prince, MUHAMMAD BIN NAYIF bin Abd al-Aziz Al Saud, in the line of succession as Crown Prince. He designated his son, MUHAMMAD BIN SALMAN bin Abd al-Aziz Al Saud, as the Deputy Crown Prince. In March 2015, Saudi Arabia led a coalition of 10 countries in a military campaign to restore the legitimate government of Yemen, which had been ousted by Huthi forces allied with former president ALI ABDULLAH al-Salih. The war in Yemen has drawn international criticism for civilian casualties and its effect on the countrys dire humanitarian situation. In December 2015, then Deputy Crown Prince MUHAMMAD BIN SALMAN announced Saudi Arabia would lead a 34-nation Islamic Coalition to fight terrorism (it has since grown to 41 nations). In May 2017, Saudi Arabia inaugurated the Global Center for Combatting Extremist Ideology (also known as \"Etidal\") as part of its ongoing efforts to counter violent extremism. In June 2017, King SALMAN elevated MUHAMMAD BIN SALMAN to Crown Prince.The country remains a leading producer of oil and natural gas and holds about 16% of the world's proven oil reserves as of 2015. The government continues to pursue economic reform and diversification, particularly since Saudi Arabia's accession to the WTO in 2005, and promotes foreign investment in the Kingdom. In April 2016, the Saudi Government announced a broad set of socio-economic reforms, known as Vision 2030. Low global oil prices throughout 2015 and 2016 significantly lowered Saudi Arabias governmental revenue. In response, the government cut subsidies on water, electricity, and gasoline; reduced government employee compensation packages; and announced limited new land taxes. In coordination with OPEC and some key non-OPEC countries, Saudi Arabia agreed cut oil output in early 2017 to regulate supply and help elevate global prices.",
        region: "Middle East",
        capital: "Riyadh",
        "birth rate": 14.7,
        "death rate": 3.4,
        "population growth": 1.6,
        "labor force": 13800000,
        population: 34173498,
        "median age": 30.8,
        "GDP(PPP)": 1775000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SA-flag.gif"
    },
    {
        id: "SN",
        name: "Senegal",
        background: "The French colonies of Senegal and French Sudan were merged in 1959 and granted independence in 1960 as the Mali Federation. The union broke up after only a few months. Senegal joined with The Gambia to form the nominal confederation of Senegambia in 1982. The envisaged integration of the two countries was never implemented, and the union was dissolved in 1989. The Movement of Democratic Forces in the Casamance has led a low-level separatist insurgency in southern Senegal since the 1980s. Several attempts at reaching a comprehensive peace agreement have failed to resolve the conflict but, despite sporadic incidents of violence, an unofficial cease-fire has remained largely in effect since 2012. Senegal remains one of the most stable democracies in Africa and has a long history of participating in international peacekeeping and regional mediation. Senegal was ruled by the Socialist Party of Senegal, first under President Lopold Sdar SENGHOR, and then President Abdou DIOUF, for 40 years until Abdoulaye WADE was elected president in 2000. He was re-elected in 2007 and during his two terms amended Senegal's constitution over a dozen times to increase executive power and weaken the opposition. His decision to run for a third presidential term sparked a large public backlash that led to his defeat in a March 2012 runoff with Macky SALL. A 2016 constitutional referendum reduced the term to five years with a maximum of two consecutive terms for future presidents - the change did not apply to SALL's first term. SALL won his bid for re-election in February 2019; his term will end in 2024. A month after the election, the National Assembly voted to abolish the office of the prime minister. Opposition organizations and civil society have criticized the decision as a further concentration of power in the executive branch at the expense of the legislative and judicial branches.",
        region: "Africa",
        capital: "Dakar",
        "birth rate": 31.8,
        "death rate": 7.6,
        "population growth": 2.31,
        "labor force": 6966000,
        population: 15736368,
        "median age": 19.4,
        "GDP(PPP)": 54800000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SG-flag.gif"
    },
    {
        id: "RS",
        name: "Serbia",
        background: "The Kingdom of Serbs, Croats, and Slovenes was formed in 1918; its name was changed to Yugoslavia in 1929. Communist Partisans resisted the Axis occupation and division of Yugoslavia from 1941 to 1945 and fought nationalist opponents and collaborators as well. The military and political movement headed by Josip Broz \"TITO\" (Partisans) took full control of Yugoslavia when their domestic rivals and the occupiers were defeated in 1945. Although communists, TITO and his successors (Tito died in 1980) managed to steer their own path between the Warsaw Pact nations and the West for the next four and a half decades. In 1989, Slobodan MILOSEVIC became president of the Republic of Serbia and his ultranationalist calls for Serbian domination led to the violent breakup of Yugoslavia along ethnic lines. In 1991, Croatia, Slovenia, and Macedonia declared independence, followed by Bosnia in 1992. The remaining republics of Serbia and Montenegro declared a new Federal Republic of Yugoslavia (FRY) in April 1992 and under MILOSEVIC's leadership, Serbia led various military campaigns to unite ethnic Serbs in neighboring republics into a \"Greater Serbia.\" These actions ultimately failed and, after international intervention, led to the signing of the Dayton Peace Accords in 1995.MILOSEVIC retained control over Serbia and eventually became president of the FRY in 1997. In 1998, an ethnic Albanian insurgency in the formerly autonomous Serbian province of Kosovo provoked a Serbian counterinsurgency campaign that resulted in massacres and massive expulsions of ethnic Albanians living in Kosovo. The MILOSEVIC government's rejection of a proposed international settlement led to NATO's bombing of Serbia in the spring of 1999. Serbian military and police forces withdrew from Kosovo in June 1999, and the UN Security Council authorized an interim UN administration and a NATO-led security force in Kosovo. FRY elections in late 2000 led to the ouster of MILOSEVIC and the installation of democratic government. In 2003, the FRY became the State Union of Serbia and Montenegro, a loose federation of the two republics. Widespread violence predominantly targeting ethnic Serbs in Kosovo in March 2004 led to more intense calls to address Kosovo's status, and the UN began facilitating status talks in 2006. In June 2006, Montenegro seceded from the federation and declared itself an independent nation. Serbia subsequently gave notice that it was the successor state to the union of Serbia and Montenegro.In February 2008, after nearly two years of inconclusive negotiations, Kosovo declared itself independent of Serbia - an action Serbia refuses to recognize. At Serbia's request, the UN General Assembly (UNGA) in October 2008 sought an advisory opinion from the International Court of Justice (ICJ) on whether Kosovo's unilateral declaration of independence was in accordance with international law. In a ruling considered unfavorable to Serbia, the ICJ issued an advisory opinion in July 2010 stating that international law did not prohibit declarations of independence. In late 2010, Serbia agreed to an EU-drafted UNGA Resolution acknowledging the ICJ's decision and calling for a new round of talks between Serbia and Kosovo, this time on practical issues rather than Kosovo's status. Serbia and Kosovo signed the first agreement of principles governing the normalization of relations between the two countries in April 2013 and are in the process of implementing its provisions. In 2015, Serbia and Kosovo reached four additional agreements within the EU-led Brussels Dialogue framework. These included agreements on the Community of Serb-Majority Municipalities; telecommunications; energy production and distribution; and freedom of movement. President Aleksandar VUCIC has promoted an ambitious goal of Serbia joining the EU by 2025. Under his leadership as prime minister, in 2014 Serbia opened formal negotiations for accession. ",
        region: "Europe",
        capital: "Belgrade",
        "birth rate": 8.8,
        "death rate": 13.5,
        "population growth": -0.47,
        "labor force": 2920000,
        population: 7012165,
        "median age": 43.4,
        "GDP(PPP)": 105700000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/RI-flag.gif"
    },
    {
        id: "SC",
        name: "Seychelles",
        background: "A lengthy struggle between France and Great Britain for the islands ended in 1814, when they were ceded to the latter. During colonial rule, a plantation-based economy developed that relied on imported labor, primarily from European colonies in Africa. Independence came in 1976. Following a coup detat in 1977, the country was a socialist one-party state until adopting a new constitution and holding free elections in 1993. President France-Albert RENE, who had served since 1977, was reelected in 2001, but stepped down in 2004. Vice President James Alix MICHEL took over the presidency and in 2006 was elected to a new five-year term; he was reelected in 2011 and again in 2015. In 2016, James MICHEL resigned and handed over the presidency to his vice-president, Danny FAURE.",
        region: "Africa",
        capital: "Victoria",
        "birth rate": 12.8,
        "death rate": 7.1,
        "population growth": 0.69,
        "labor force": 47210,
        population: 95981,
        "median age": 36.8,
        "GDP(PPP)": 2750000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SE-flag.gif"
    },
    {
        id: "SL",
        name: "Sierra Leone",
        background: "The British set up a trading post near present-day Freetown in the 17th century. Originally, the trade involved timber and ivory, but later it expanded to slaves. Following the American Revolution, a colony was established in 1787 and Sierra Leone became a destination for resettling black loyalists who had originally been resettled in Nova Scotia. After the abolition of the slave trade in 1807, British crews delivered thousands of Africans liberated from illegal slave ships to Sierra Leone, particularly Freetown. The colony gradually expanded inland during the course of the 19th century; independence was attained in 1961. Democracy is slowly being reestablished after the civil war (1991-2002) that resulted in tens of thousands of deaths and the displacement of more than 2 million people (about one-third of the population). The military, which took over full responsibility for security following the departure of UN peacekeepers at the end of 2005, has developed as a guarantor of the country's stability; the armed forces remained on the sideline during the 2007, 2012, and 2018 national elections. In March 2014, the closure of the UN Integrated Peacebuilding Office in Sierra Leone marked the end of more than 15 years of peacekeeping and political operations in Sierra Leone. The government's stated priorities include free primary and secondary education, economic growth, accountable governance, health, and infrastructure.",
        region: "Africa",
        capital: "Freetown",
        "birth rate": 35.4,
        "death rate": 9.8,
        "population growth": 2.43,
        "labor force": 2972000,
        population: 6624933,
        "median age": 19.1,
        "GDP(PPP)": 11550000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SL-flag.gif"
    },
    {
        id: "SG",
        name: "Singapore",
        background: "A Malay trading port known as Temasek existed on the island of Singapore by the 14th century. The settlement changed hands several times in the ensuing centuries and was eventually burned in the 17th century and fell into obscurity. The British founded modern Singapore as a trading colony on the site in 1819. It joined the Malaysian Federation in 1963 but was ousted two years later and became independent. Singapore subsequently became one of the world's most prosperous countries with strong international trading links (its port is one of the world's busiest in terms of tonnage handled) and with per capita GDP equal to that of the leading nations of Western Europe.",
        region: "Asia",
        capital: "Singapore",
        "birth rate": 8.9,
        "death rate": 3.6,
        "population growth": 1.73,
        "labor force": 3657000,
        population: 6209660,
        "median age": 35.6,
        "GDP(PPP)": 528100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SN-flag.gif"
    },
    {
        id: "SX",
        name: "Sint Maarten",
        background: "Although sighted by Christopher COLUMBUS in 1493 and claimed for Spain, it was the Dutch who occupied the island in 1631 and began exploiting its salt deposits. The Spanish retook the island in 1633, but the Dutch continued to assert their claims. The Spanish finally relinquished the island of Saint Martin to the French and Dutch, who divided it between themselves in 1648. The establishment of cotton, tobacco, and sugar plantations dramatically expanded African slavery on the island in the 18th and 19th centuries; the practice was not abolished in the Dutch half until 1863. The island's economy declined until 1939 when it became a free port; the tourism industry was dramatically expanded beginning in the 1950s. In 1954, Sint Maarten and several other Dutch Caribbean possessions became part of the Kingdom of the Netherlands as the Netherlands Antilles. In a 2000 referendum, the citizens of Sint Maarten voted to become a self-governing country within the Kingdom of the Netherlands, effective October 2010. On 6 September 2017, Hurricane Irma hit Saint Martin/Sint Maarten, causing extensive damage to roads, communications, electrical power, and housing. The UN estimated the storm destroyed or damaged 90% of the buildings, and Princess Juliana International Airport was heavily damaged and closed to commercial air traffic for five weeks.",
        region: "Central America & The Caribbean",
        capital: "Philipsburg",
        "birth rate": 12.9,
        "death rate": 5.8,
        "population growth": 1.34,
        "labor force": 23200,
        population: 43847,
        "median age": 41.1,
        "GDP(PPP)": 365800000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NN-flag.gif"
    },
    {
        id: "SK",
        name: "Slovakia",
        background: 'Slovakia traces its roots to the 9th century state of Great Moravia. Subsequently, the Slovaks became part of the Hungarian Kingdom, where they remained for the next 1,000 years. After the formation of the dual Austro-Hungarian monarchy in 1867, backlash to language and education policies favoring the use of Hungarian (Magyarization) encouraged the strengthening of Slovak nationalism and a cultivation of cultural ties with the closely related Czechs, who fell administratively under the Austrian half of the empire. After the dissolution of the Austro-Hungarian Empire at the close of World War I, the Slovaks joined the Czechs to form Czechoslovakia. The new state was envisioned as a nation with Czech and Slovak branches. During the interwar period, Slovak nationalist leaders pushed for autonomy within Czechoslovakia, and in 1939 Slovakia became an independent state created by and allied with Nazi Germany. Following World War II, Czechoslovakia was reconstituted and came under communist rule within Soviet-dominated Eastern Europe. In 1968, an invasion by Warsaw Pact troops ended the efforts of Czechoslovakia\'s leaders to liberalize communist rule and create "socialism with a human face," ushering in a period of repression known as "normalization." The peaceful "Velvet Revolution" swept the Communist Party from power at the end of 1989 and inaugurated a return to democratic rule and a market economy. On 1 January 1993, Czechoslovakia underwent a nonviolent "velvet divorce" into its two national components, Slovakia and the Czech Republic. Slovakia joined both NATO and the EU in the spring of 2004 and the euro zone on 1 January 2009.',
        region: "Europe",
        capital: "Bratislava",
        "birth rate": 9.3,
        "death rate": 10.1,
        "population growth": -0.05,
        "labor force": 2758000,
        population: 5440602,
        "median age": 41.8,
        "GDP(PPP)": 179700000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/LO-flag.gif"
    },
    {
        id: "SI",
        name: "Slovenia",
        background: "The Slovene lands were part of the Austro-Hungarian Empire until the latter's dissolution at the end of World War I. In 1918, the Slovenes joined the Serbs and Croats in forming a new multinational state, which was named Yugoslavia in 1929. After World War II, Slovenia was one of the republics in the restored Yugoslavia, which, though communist, soon distanced itself from the Soviet Union and spearheaded the Non-Aligned Movement. Dissatisfied with the exercise of power by the majority Serbs, the Slovenes succeeded in establishing their independence in 1991 after a short 10-day war. Historical ties to Western Europe, a growing economy, and a stable democracy have assisted in Slovenia's postcommunist transition. Slovenia acceded to both NATO and the EU in the spring of 2004; it joined the euro zone and the Schengen zone in 2007.",
        region: "Europe",
        capital: "Ljubljana",
        "birth rate": 8.7,
        "death rate": 10.3,
        "population growth": 0.01,
        "labor force": 959000,
        population: 2102678,
        "median age": 44.9,
        "GDP(PPP)": 71230000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SI-flag.gif"
    },
    {
        id: "SB",
        name: "Solomon Islands",
        background: "The UK established a protectorate over the Solomon Islands in the 1890s. Some of the bitterest fighting of World War II occurred on this archipelago and the Guadalcanal Campaign (August 1942-February 1943) proved a turning point in the Pacific War, since after the operation the Japanese lost their strategic initiative and remained on the defensive until thier final defeat in 1945. Self-government for the Solomon Islands came in 1976 and independence two years later. Ethnic violence, government malfeasance, endemic crime, and a narrow economic base have undermined stability and civil society. In June 2003, then Prime Minister Sir Allan KEMAKEZA sought the assistance of Australia in reestablishing law and order; the following month, an Australian-led multinational force arrived to restore peace and disarm ethnic militias. The Regional Assistance Mission to the Solomon Islands (RAMSI), which ended in June 2017, was generally effective in restoring law and order and rebuilding government institutions.",
        region: "Oceania",
        capital: "Honiara",
        "birth rate": 23.6,
        "death rate": 3.8,
        "population growth": 1.84,
        "labor force": 202500,
        population: 685097,
        "median age": 23.5,
        "GDP(PPP)": 1330000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/BP-flag.gif"
    },
    {
        id: "SO",
        name: "Somalia",
        background: "Britain withdrew from British Somaliland in 1960 to allow its protectorate to join with Italian Somaliland and form the new nation of Somalia. In 1969, a coup headed by Mohamed SIAD Barre ushered in an authoritarian socialist rule characterized by the persecution, jailing, and torture of political opponents and dissidents. After the regime's collapse early in 1991, Somalia descended into turmoil, factional fighting, and anarchy. In May 1991, northern clans declared an independent Republic of Somaliland that now includes the administrative regions of Awdal, Woqooyi Galbeed, Togdheer, Sanaag, and Sool. Although not recognized by any government, this entity has maintained a stable existence and continues efforts to establish a constitutional democracy, including holding municipal, parliamentary, and presidential elections. The regions of Bari, Nugaal, and northern Mudug comprise a neighboring semi-autonomous state of Puntland, which has been self-governing since 1998 but does not aim at independence; it has also made strides toward reconstructing a legitimate, representative government but has suffered some civil strife. Puntland disputes its border with Somaliland as it also claims the regions of Sool and Sanaag, and portions of Togdheer. Beginning in 1993, a two-year UN humanitarian effort (primarily in south-central Somalia) was able to alleviate famine conditions, but when the UN withdrew in 1995, having suffered significant casualties, order still had not been restored.In 2000, the Somalia National Peace Conference (SNPC) held in Djibouti resulted in the formation of an interim government, known as the Transitional National Government (TNG). When the TNG failed to establish adequate security or governing institutions, the Government of Kenya, under the auspices of the Intergovernmental Authority on Development (IGAD), led a subsequent peace process that concluded in October 2004 with the election of Abdullahi YUSUF Ahmed as President of a second interim government, known as the Transitional Federal Government (TFG) of the Somali Republic. The TFG included a 275-member parliamentary body, known as the Transitional Federal Parliament (TFP). President YUSUF resigned late in 2008 while UN-sponsored talks between the TFG and the opposition Alliance for the Re-Liberation of Somalia (ARS) were underway in Djibouti. In January 2009, following the creation of a TFG-ARS unity government, Ethiopian military forces, which had entered Somalia in December 2006 to support the TFG in the face of advances by the opposition Islamic Courts Union (ICU), withdrew from the country. The TFP was doubled in size to 550 seats with the addition of 200 ARS and 75 civil society members of parliament. The expanded parliament elected Sheikh SHARIF Sheikh Ahmed, the former ICU and ARS chairman as president in January 2009. The creation of the TFG was based on the Transitional Federal Charter (TFC), which outlined a five-year mandate leading to the establishment of a new Somali constitution and a transition to a representative government following national elections. In 2009, the TFP amended the TFC to extend TFG's mandate until 2011 and in 2011 Somali principals agreed to institute political transition by August 2012. The transition process ended in September 2012 when clan elders replaced the TFP by appointing 275 members to a new parliament who subsequently elected a new president.",
        region: "Africa",
        capital: "Mogadishu",
        "birth rate": 38.7,
        "death rate": 12.4,
        "population growth": 2.21,
        "labor force": 4154000,
        population: 11757124,
        "median age": 18.5,
        "GDP(PPP)": 20440000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SO-flag.gif"
    },
    {
        id: "ZA",
        name: "South Africa",
        background: 'Some of the earliest human remains in the fossil record are found in South Africa. By about A.D. 500, Bantu speaking groups began settling into what is now northeastern South Africa displacing Khoisan speaking groups to the southwest. Dutch traders landed at the southern tip of present-day South Africa in 1652 and established a stopover point on the spice route between the Netherlands and the Far East, founding the city of Cape Town. After the British seized the Cape of Good Hope area in 1806, many of the settlers of Dutch descent (Afrikaners, also called "Boers" (farmers) at the time) trekked north to found their own republics, Transvaal and Orange Free State. In the 1820s, several decades of wars began as the Zulus expanded their territory, moving out of what is today southeastern South Africa and clashing with other indigenous peoples and with expanding European settlements. The discovery of diamonds (1867) and gold (1886) spurred wealth and immigration from Europe.The Anglo-Zulu War (1879) resulted in the incorporation of the Zulu kingdom\'s territory into the British Empire. Subsequently, the Afrikaner republics were incorporated into the British Empire after their defeat in the Second South African War (1899-1902). However, the British and the Afrikaners ruled together beginning in 1910 under the Union of South Africa, which became a republic in 1961 after a whites-only referendum. In 1948, the National Party was voted into power and instituted a policy of apartheid  billed as "separate development" of the races - which favored the white minority at the expense of the black majority and other non-white groups. The African National Congress (ANC) led the opposition to apartheid and many top ANC leaders, such as Nelson MANDELA, spent decades in South Africa\'s prisons. Internal protests and insurgency, as well as boycotts by some Western nations and institutions, led to the regime\'s eventual willingness to negotiate a peaceful transition to majority rule.The first multi-racial elections in 1994 following the end of apartheid ushered in majority rule under an ANC-led government. South Africa has since struggled to address apartheid-era imbalances in wealth, housing, education, and health care. Jacob ZUMA became president in 2009 and was reelected in 2014, but resigned in February 2018 after numerous corruption scandals and gains by opposition parties in municipal elections in 2016. His successor, Cyril RAMAPHOSA, has made some progress in reigning in corruption, though many challenges persist. In May 2019 national elections, the countrys sixth since the end of apartheid, the ANC won a majority of parliamentary seats, delivering RAMAPHOSA a five-year term.',
        region: "Africa",
        capital: "Pretoria",
        "birth rate": 19.2,
        "death rate": 9.3,
        "population growth": 0.97,
        "labor force": 22190000,
        population: 56463617,
        "median age": 28,
        "GDP(PPP)": 767200000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SF-flag.gif"
    },
    {
        id: "SS",
        name: "South Sudan",
        background: 'British explorer Samuel BAKER established the colony of Equatoria in 1870, in the name of the Ottoman Khedive of Egypt who claimed the territory. Headquartered in Gondokoro (near modern day Juba), Equatoria in theory composed most of what is now South Sudan. After being cut off from colonial administration during the Mahdist War from 1885-1898, Equatoria was made a state under the Anglo-Egyptian condominium in 1899. It was largely left to itself over the following decades, but Christian missionaries converted much of the population and facilitated the spread of English, rather than Arabic. Equatoria was ruled by British colonial administrators separately from what is now Sudan until the two colonies were combined at the 1947 Juba Conference, as part of British plans to prepare the region for independence. When Sudan gained its independence in 1956, it was with the understanding that the southerners would be able to participate fully in the political system. When the Arab Khartoum government reneged on its promises, a mutiny began that led to two prolonged periods of conflict (1955-1972 and 1983-2005) in which perhaps 2.5 million people died - mostly civilians - due to starvation and drought. Ongoing peace talks finally resulted in a Comprehensive Peace Agreement, signed in January 2005. As part of this agreement, the south was granted a six-year period of autonomy to be followed by a referendum on final status. The result of this referendum, held in January 2011, was a vote of 98% in favor of secession.Since independence on 9 July 2011, South Sudan has struggled with good governance and nation building and has attempted to control opposition forces operating in its territory. Economic conditions have deteriorated since January 2012 when the government decided to shut down oil production following bilateral disagreements with Sudan. In December 2013, conflict between government and opposition forces killed tens of thousands and led to a dire humanitarian crisis with millions of South Sudanese displaced and food insecure. The warring parties signed a peace agreement in August 2015 that created a transitional government of national unity in April 2016. However, in July 2016, fighting broke out in Juba between the two principal signatories, plunging the country back into conflict. A "revitalized" peace agreement was signed in September 2018 ending the fighting. Under the agreement, the government and various rebel groups agreed that the sides would form a unified national army and create a transitional government by May 2019. The agreement was extended until November 2019 and then subsequently to February 2020. However, implementation has been stalled, in part by a failure to agree on the country\'s internal political boundaries.',
        region: "Africa",
        capital: "Juba",
        "birth rate": 38.8,
        "death rate": 11.4,
        "population growth": 2.7,
        "labor force": 4724000,
        population: 10561244,
        "median age": 18.6,
        "GDP(PPP)": 20010000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/OD-flag.gif"
    },
    {
        id: "ES",
        name: "Spain",
        background: "Spain's powerful world empire of the 16th and 17th centuries ultimately yielded command of the seas to England. Subsequent failure to embrace the mercantile and industrial revolutions caused the country to fall behind Britain, France, and Germany in economic and political power. Spain remained neutral in World War I and II, but suffered through a devastating civil war (1936-39). A peaceful transition to democracy following the death of dictator Francisco FRANCO in 1975, and rapid economic modernization (Spain joined the EU in 1986) gave Spain a dynamic and rapidly growing economy, and made it a global champion of freedom and human rights. More recently, Spain has emerged from a severe economic recession that began in mid-2008, posting four straight years of GDP growth above the EU average. Unemployment has fallen, but remains high, especially among youth. Spain is the Eurozone's fourth largest economy. The country has faced increased domestic turmoil in recent years due to the independence movement in its restive Catalonia region.",
        region: "Europe",
        capital: "Madrid",
        "birth rate": 8.7,
        "death rate": 9.3,
        "population growth": 0.67,
        "labor force": 22750000,
        population: 50015792,
        "median age": 43.9,
        "GDP(PPP)": 1778000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SP-flag.gif"
    },
    {
        id: "LK",
        name: "Sri Lanka",
        background: "The first Sinhalese arrived in Sri Lanka late in the 6th century B.C., probably from northern India. Buddhism was introduced circa 250 B.C., and the first kingdoms developed at the cities of Anuradhapura (from circa 200 B.C. to circa A.D. 1000) and Polonnaruwa (from about 1070 to 1200). In the 14th century, a south Indian dynasty established a Tamil kingdom in northern Sri Lanka. The Portuguese controlled the coastal areas of the island in the 16th century followed by the Dutch in the 17th century. The island was ceded to the British in 1796, became a crown colony in 1802, and was formally united under British rule by 1815. As Ceylon, it became independent in 1948; its name was changed to Sri Lanka in 1972. Prevailing tensions between the Sinhalese majority and Tamil separatists erupted into war in July 1983. Fighting between the government and Liberation Tigers of Tamil Eelam (LTTE) continued for over a quarter century. Although Norway brokered peace negotiations that led to a ceasefire in 2002, the fighting slowly resumed and was again in full force by 2006. The government defeated the LTTE in May 2009.During the post-conflict years under President Mahinda RAJAPAKSA, the government initiated infrastructure development projects, many of which were financed by loans from China. His regime faced significant allegations of human rights violations and a shrinking democratic space for civil society. In 2015, a new coalition government headed by President Maithripala SIRISENA of the Sri Lanka Freedom Party and Prime Minister Ranil WICKREMESINGHE of the United National Party came to power with pledges to advance economic, governance, anti-corruption, reconciliation, justice, and accountability reforms. However, implementation of these reforms has been uneven. In October 2018, President SIRISENA attempted to oust Prime Minister WICKREMESINGHE, swearing in former President RAJAPAKSA as the new prime minister and issuing an order to dissolve the parliament and hold elections. This sparked a seven-week constitutional crisis that ended when the Supreme Court ruled SIRISENAs actions unconstitutional, RAJAPAKSA resigned, and WICKREMESINGHE was reinstated. In November 2019, Gotabaya RAJAPAKSA won the presidential election and appointed his brother, Mahinda, prime minister.",
        region: "Asia",
        capital: "Colombo",
        "birth rate": 14.2,
        "death rate": 6.5,
        "population growth": 0.67,
        "labor force": 8937000,
        population: 22889201,
        "median age": 33.7,
        "GDP(PPP)": 275800000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/CE-flag.gif"
    },
    {
        id: "SD",
        name: "Sudan",
        background: "Military regimes favoring Islamic-oriented governments have dominated national politics since independence from Anglo-Egyptian co-rule in 1956. Sudan was embroiled in two prolonged civil wars during most of the remainder of the 20th century. These conflicts were rooted in northern economic, political, and social domination of largely non-Muslim, non-Arab southern Sudanese. The first civil war ended in 1972 but another broke out in 1983. Peace talks gained momentum in 2002-04 with the signing of several accords. The final North/South Comprehensive Peace Agreement (CPA), signed in January 2005, granted the southern rebels autonomy for six years followed by a referendum on independence for Southern Sudan. The referendum was held in January 2011 and indicated overwhelming support for independence. South Sudan became independent on 9 July 2011. Sudan and South Sudan have yet to fully implement security and economic agreements signed in September 2012 relating to the normalization of relations between the two countries. The final disposition of the contested Abyei region has also to be decided. The 30-year reign of President Umar Hassan Ahmad al-BASHIR ended in his ouster in April 2019, and a Sovereignty Council, a joint civilian-military-executive body, holds power as of November 2019.Following South Sudan's independence, conflict broke out between the government and the Sudan People's Liberation Movement-North in Southern Kordofan and Blue Nile states (together known as the Two Areas), resulting in a humanitarian crisis affecting more than a million people. A earlier conflict that broke out in the western region of Darfur in 2003, displaced nearly 2 million people and caused thousands of deaths. While some repatriation has taken place, about 1.83 million IDPs remain in Sudan as of May 2019. Fighting in both the Two Areas and Darfur between government forces and opposition has largely subsided, however the civilian populations are affected by low-level violence including inter-tribal conflict and banditry, largely a result of weak rule of law. The UN and the African Union have jointly commanded a Darfur peacekeeping operation (UNAMID) since 2007, but are slowly drawing down as the situation in Darfur becomes more stable. Sudan also has faced refugee influxes from neighboring countries, primarily Ethiopia, Eritrea, Chad, Central African Republic, and South Sudan. Armed conflict, poor transport infrastructure, and denial of access by both the government and armed opposition have impeded the provision of humanitarian assistance to affected populations. However, Sudan's new transitional government has stated its priority to allow greater humanitarian access, as the food security and humanitarian situation in Sudan worsens and as it appeals to the West for greater engagement.",
        region: "Africa",
        capital: "Khartoum",
        "birth rate": 33.8,
        "death rate": 6.5,
        "population growth": 2.69,
        "labor force": 11920000,
        population: 45561556,
        "median age": 18.3,
        "GDP(PPP)": 177400000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SU-flag.gif"
    },
    {
        id: "SR",
        name: "Suriname",
        background: "First explored by the Spaniards in the 16th century and then settled by the English in the mid-17th century, Suriname became a Dutch colony in 1667. With the abolition of African slavery in 1863, workers were brought in from India and Java. The Netherlands granted the colony independence in 1975. Five years later the civilian government was replaced by a military regime that soon declared Suriname a socialist republic. It continued to exert control through a succession of nominally civilian administrations until 1987, when international pressure finally forced a democratic election. In 1990, the military overthrew the civilian leadership, but a democratically elected government - a four-party coalition - returned to power in 1991. The coalition expanded to eight parties in 2005 and ruled until August 2010, when voters returned former military leader Desire BOUTERSE and his opposition coalition to power. President BOUTERSE was reelected unopposed in 2015.",
        region: "South America",
        capital: "Paramaribo",
        "birth rate": 14.9,
        "death rate": 6.2,
        "population growth": 0.95,
        "labor force": 144000,
        population: 609569,
        "median age": 31,
        "GDP(PPP)": 8688000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NS-flag.gif"
    },
    {
        id: "SE",
        name: "Sweden",
        background: "A military power during the 17th century, Sweden has not participated in any war for two centuries. An armed neutrality was preserved in both World Wars. Since then, Sweden has pursued a successful economic formula consisting of a capitalist system intermixed with substantial welfare elements. Sweden joined the EU in 1995, but the public rejected the introduction of the euro in a 2003 referendum. The share of Swedens population born abroad increased from 11.3% in 2000 to 19.1% in 2018.",
        region: "Europe",
        capital: "Stockholm",
        "birth rate": 12.1,
        "death rate": 9.4,
        "population growth": 0.79,
        "labor force": 5361000,
        population: 10202491,
        "median age": 41.1,
        "GDP(PPP)": 518000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SW-flag.gif"
    },
    {
        id: "CH",
        name: "Switzerland",
        background: "The Swiss Confederation was founded in 1291 as a defensive alliance among three cantons. In succeeding years, other localities joined the original three. The Swiss Confederation secured its independence from the Holy Roman Empire in 1499. A constitution of 1848, subsequently modified in 1874 to allow voters to introduce referenda on proposed laws, replaced the confederation with a centralized federal government. Switzerland's sovereignty and neutrality have long been honored by the major European powers, and the country was not involved in either of the two world wars. The political and economic integration of Europe over the past half century, as well as Switzerland's role in many UN and international organizations, has strengthened Switzerland's ties with its neighbors. However, the country did not officially become a UN member until 2002. Switzerland remains active in many UN and international organizations but retains a strong commitment to neutrality.",
        region: "Europe",
        capital: "Bern",
        "birth rate": 10.5,
        "death rate": 8.5,
        "population growth": 0.66,
        "labor force": 5159000,
        population: 8403994,
        "median age": 42.7,
        "GDP(PPP)": 523100000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SZ-flag.gif"
    },
    {
        id: "SY",
        name: "Syria",
        background: "Following World War I, France acquired a mandate over the northern portion of the former Ottoman Empire province of Syria. The French administered the area as Syria until granting it independence in 1946. The new country lacked political stability and experienced a series of military coups. Syria united with Egypt in February 1958 to form the United Arab Republic. In September 1961, the two entities separated, and the Syrian Arab Republic was reestablished. In the 1967 Arab-Israeli War, Syria lost the Golan Heights region to Israel. During the 1990s, Syria and Israel held occasional, albeit unsuccessful, peace talks over its return. In November 1970, Hafiz al-ASAD, a member of the socialist Ba'ath Party and the minority Alawi sect, seized power in a bloodless coup and brought political stability to the country. Following the death of President Hafiz al-ASAD, his son, Bashar al-ASAD, was approved as president by popular referendum in July 2000. Syrian troops - stationed in Lebanon since 1976 in an ostensible peacekeeping role - were withdrawn in April 2005. During the July-August 2006 conflict between Israel and Hizballah, Syria placed its military forces on alert but did not intervene directly on behalf of its ally Hizballah. In May 2007, Bashar al-ASAD's second term as president was approved by popular referendum.Influenced by major uprisings that began elsewhere in the region, and compounded by additional social and economic factors, antigovernment protests broke out first in the southern province of Dar'a in March 2011 with protesters calling for the repeal of the restrictive Emergency Law allowing arrests without charge, the legalization of political parties, and the removal of corrupt local officials. Demonstrations and violent unrest spread across Syria with the size and intensity of protests fluctuating. The government responded to unrest with a mix of concessions - including the repeal of the Emergency Law, new laws permitting new political parties, and liberalizing local and national elections - and with military force and detentions. The government's efforts to quell unrest and armed opposition activity led to extended clashes and eventually civil war between government forces, their allies, and oppositionists.International pressure on the ASAD regime intensified after late 2011, as the Arab League, the EU, Turkey, and the US expanded economic sanctions against the regime and those entities that support it. In December 2012, the Syrian National Coalition, was recognized by more than 130 countries as the sole legitimate representative of the Syrian people. In September 2015, Russia launched a military intervention on behalf of the ASAD regime, and domestic and foreign government-aligned forces recaptured swaths of territory from opposition forces, and eventually the countrys second largest city, Aleppo, in December 2016, shifting the conflict in the regimes favor. The regime, with this foreign support, also recaptured opposition strongholds in the Damascus suburbs and the southern province of Dara in 2018. The government lacks territorial control over much of the northeastern part of the country, which is dominated by the predominantly Kurdish Syrian Democratic Forces (SDF). The SDF has expanded its territorial hold over much of the northeast since 2014 as it has captured territory from the Islamic State of Iraq and Syria. Since 2016, Turkey has also conducted three large-scale military operations into Syria, capturing territory along Syria's northern border in the provinces of Aleppo, Ar Raqqah, and Al Hasakah. Political negotiations between the government and opposition delegations at UN-sponsored Geneva conferences since 2014 have failed to produce a resolution of the conflict. Since early 2017, Iran, Russia, and Turkey have held separate political negotiations outside of UN auspices to attempt to reduce violence in Syria. According to an April 2016 UN estimate, the death toll among Syrian Government forces, opposition forces, and civilians was over 400,000, though other estimates placed the number well over 500,000. As of December 2019, approximately 6 million Syrians were internally displaced. Approximately 11.1 million people were in need of humanitarian assistance across the country, and an additional 5.7 million Syrians were registered refugees in Turkey, Jordan, Iraq, Egypt, and North Africa. The conflict in Syria remains one of the largest humanitarian crises worldwide.",
        region: "Middle East",
        capital: "Damascus",
        "birth rate": 23.8,
        "death rate": 4.5,
        "population growth": 4.25,
        "labor force": 3767000,
        population: 19398448,
        "median age": 23.5,
        "GDP(PPP)": 50280000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/SY-flag.gif"
    },
    {
        id: "TW",
        name: "Taiwan",
        background: "First inhabited by Austronesian people, Taiwan became home to Han immigrants beginning in the late Ming Dynasty (17th century). In 1895, military defeat forced China's Qing Dynasty to cede Taiwan to Japan, which then governed Taiwan for 50 years. Taiwan came under Chinese Nationalist (Kuomintang, KMT) control after World War II. With the communist victory in the Chinese civil war in 1949, the Nationalist-controlled Republic of China government and 2 million Nationalists fled to Taiwan and continued to claim to be the legitimate government for mainland China and Taiwan based on a 1947 Constitution drawn up for all of China. Until 1987, however, the Nationalist government ruled Taiwan under a civil war martial law declaration dating to 1948. Beginning in the 1970s, Nationalist authorities gradually began to incorporate the native population into the governing structure beyond the local level. The democratization process expanded rapidly in the 1980s, leading to the then illegal founding of Taiwans first opposition party (the Democratic Progressive Party or DPP) in 1986 and the lifting of martial law the following year. Taiwan held legislative elections in 1992, the first in over forty years, and its first direct presidential election in 1996. In the 2000 presidential elections, Taiwan underwent its first peaceful transfer of power with the KMT loss to the DPP and afterwards experienced two additional democratic transfers of power in 2008 and 2016. Throughout this period, the island prospered, became one of East Asia's economic \"Tigers,\" and after 2000 became a major investor in mainland China as cross-Strait ties matured. The dominant political issues continue to be economic reform and growth as well as management of sensitive relations between Taiwan and China.",
        region: "Asia",
        capital: "Taipei",
        "birth rate": 8,
        "death rate": 7.9,
        "population growth": 0.11,
        "labor force": 11780000,
        population: 23603049,
        "median age": 42.3,
        "GDP(PPP)": 1189000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TW-flag.gif"
    },
    {
        id: "TJ",
        name: "Tajikistan",
        background: 'The Tajik people came under Russian imperial rule in the 1860s and 1870s, but Russia\'s hold on Central Asia weakened following the Revolution of 1917. At that time, bands of indigenous guerrillas (called "basmachi") fiercely contested Bolshevik control of the area, which was not fully reestablished until 1925. Tajikistan was first created as an autonomous republic within Uzbekistan in 1924, but in 1929 the USSR designated Tajikistan a separate republic and transferred to it much of present-day Sughd province. Ethnic Uzbeks form a substantial minority in Tajikistan, and ethnic Tajiks an even larger minority in Uzbekistan. Tajikistan became independent in 1991 following the breakup of the Soviet Union, and experienced a civil war between political, regional, and religious factions from 1992 to 1997.Though the country holds general elections for both the presidency (once every seven years) and parliament (once every five years), observers note an electoral system rife with irregularities and abuse, with results that are neither free nor fair. President Emomali RAHMON, who came to power in 1994 during the civil war, used an attack planned by a disaffected deputy defense minister in 2015 to ban the last major opposition political party in Tajikistan. In December 2015, RAHMON further strengthened his position by having himself declared "Founder of Peace and National Unity, Leader of the Nation," with limitless terms and lifelong immunity through constitutional amendments ratified in a referendum. The referendum also lowered the minimum age required to run for president from 35 to 30, which would make RAHMON\'s son Rustam EMOMALI, the current mayor of the capital city of Dushanbe, eligible to run for president in 2020. The country remains the poorest in the former Soviet sphere. Tajikistan became a member of the WTO in March 2013. However, its economy continues to face major challenges, including dependence on remittances from Tajikistani migrant laborers working in Russia and Kazakhstan, pervasive corruption, and the opiate trade and other destabilizing violence emanating from neighboring Afghanistan. Tajikistan has endured several domestic security incidents since 2010, including armed conflict between government forces and local strongmen in the Rasht Valley and between government forces and criminal groups in Gorno-Badakhshan Autonomous Oblast. Tajikistan suffered its first ISIS-claimed attack in 2018, when assailants attacked a group of Western bicyclists with vehicles and knives, killing four.',
        region: "Asia",
        capital: "Dushanbe",
        "birth rate": 21.8,
        "death rate": 5.8,
        "population growth": 1.52,
        "labor force": 2295000,
        population: 8873669,
        "median age": 25.3,
        "GDP(PPP)": 28430000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TI-flag.gif"
    },
    {
        id: "TZ",
        name: "Tanzania",
        background: "Shortly after achieving independence from Britain in the early 1960s, Tanganyika and Zanzibar merged to form the United Republic of Tanzania in 1964. In 1995, the country held its first democratic elections since the 1970s. Zanzibar maintains semi-autonomy and participates in national elections; popular political opposition on the isles led to four contentious elections since 1995, in which the ruling party claimed victory despite international observers' claims of voting irregularities.",
        region: "Africa",
        capital: "Dares Salaam",
        "birth rate": 34.6,
        "death rate": 7.1,
        "population growth": 2.71,
        "labor force": 24890000,
        population: 58552845,
        "median age": 18.2,
        "GDP(PPP)": 162500000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TZ-flag.gif"
    },
    {
        id: "TH",
        name: "Thailand",
        background: "A unified Thai kingdom was established in the mid-14th century. Known as Siam until 1939, Thailand is the only Southeast Asian country never to have been colonized by a European power. A bloodless revolution in 1932 led to the establishment of a constitutional monarchy. After the Japanese invaded Thailand in 1941, the government split into a pro-Japan faction and a pro-Ally faction backed by the King. Following the war, Thailand became a US treaty ally in 1954 after sending troops to Korea and later fighting alongside the US in Vietnam. Thailand since 2005 has experienced several rounds of political turmoil including a military coup in 2006 that ousted then Prime Minister THAKSIN Chinnawat, followed by large-scale street protests by competing political factions in 2008, 2009, and 2010. THAKSIN's youngest sister, YINGLAK Chinnawat, in 2011 led the Puea Thai Party to an electoral win and assumed control of the government.In early May 2014, after months of large-scale anti-government protests in Bangkok beginning in November 2013, YINGLAK was removed from office by the Constitutional Court and in late May 2014 the Royal Thai Army, led by Royal Thai Army Gen. PRAYUT Chan-ocha, staged a coup against the caretaker government. PRAYUT was appointed prime minister in August 2014. PRAYUT also serves as the head of the National Council for Peace and Order (NCPO), a military-affiliated body that oversees the interim government. This body created several interim institutions to promote reform and draft a new constitution, which was passed in a national referendum in August 2016. In late 2017, PRAYUT announced elections would be held by November 2018; he has subsequently suggested they might occur in February 2019. As of mid-December 2018, a previoulsy held ban on campaigning and political activity has been lifted and per parliamentary laws, an election must be held within 150 days. King PHUMIPHON Adunyadet passed away in October 2016 after 70 years on the throne; his only son, WACHIRALONGKON Bodinthrathepphayawarangkun, ascended the throne in December 2016. He signed the new constitution in April 2017. Thailand has also experienced violence associated with the ethno-nationalist insurgency in its southern Malay-Muslim majority provinces. Since January 2004, thousands have been killed and wounded in the insurgency.",
        region: "Asia",
        capital: "Bangkok",
        "birth rate": 10.7,
        "death rate": 8.3,
        "population growth": 0.25,
        "labor force": 38370000,
        population: 68977400,
        "median age": 39,
        "GDP(PPP)": 1236000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TH-flag.gif"
    },
    {
        id: "TL",
        name: "Timor-Leste",
        background: "The Portuguese began to trade with the island of Timor in the early 16th century and colonized it in mid-century. Skirmishing with the Dutch in the region eventually resulted in an 1859 treaty in which Portugal ceded the western portion of the island. Imperial Japan occupied Portuguese Timor from 1942 to 1945, but Portugal resumed colonial authority after the Japanese defeat in World War II. East Timor declared itself independent from Portugal on 28 November 1975 and was invaded and occupied by Indonesian forces nine days later. It was incorporated into Indonesia in July 1976 as the province of Timor Timur (East Timor). An unsuccessful campaign of pacification followed over the next two decades, during which an estimated 100,000 to 250,000 people died. In an August 1999 UN-supervised popular referendum, an overwhelming majority of the people of Timor-Leste voted for independence from Indonesia. However, in the next three weeks, anti-independence Timorese militias - organized and supported by the Indonesian military - commenced a large-scale, scorched-earth campaign of retribution. The militias killed approximately 1,400 Timorese and forced 300,000 people into western Timor as refugees. Most of the country's infrastructure, including homes, irrigation systems, water supply systems, and schools, and nearly all of the country's electrical grid were destroyed. On 20 September 1999, Australian-led peacekeeping troops deployed to the country and brought the violence to an end. On 20 May 2002, Timor-Leste was internationally recognized as an independent state.In 2006, internal tensions threatened the new nation's security when a military strike led to violence and a breakdown of law and order. At Dili's request, an Australian-led International Stabilization Force (ISF) deployed to Timor-Leste, and the UN Security Council established the UN Integrated Mission in Timor-Leste (UNMIT), which included an authorized police presence of over 1,600 personnel. The ISF and UNMIT restored stability, allowing for presidential and parliamentary elections in 2007 in a largely peaceful atmosphere. In February 2008, a rebel group staged an unsuccessful attack against the president and prime minister. The ringleader was killed in the attack, and most of the rebels surrendered in April 2008. Since the attack, the government has enjoyed one of its longest periods of post-independence stability, including successful 2012 elections for both the parliament and president and a successful transition of power in February 2015. In late 2012, the UN Security Council ended its peacekeeping mission in Timor-Leste and both the ISF and UNMIT departed the country. Early parliamentary elections in the spring of 2017 finally produced a majority goovernment after months of impasse. Currently, the government is a coalition of three parties and the president is a member of the opposition party. In 2018 and 2019, this configuration stymied nominations for key ministerial positions and slowed progress on certain policy issues.",
        region: "Asia",
        capital: "Dili",
        "birth rate": 32,
        "death rate": 5.7,
        "population growth": 2.27,
        "labor force": 286700,
        population: 1383723,
        "median age": 19.6,
        "GDP(PPP)": 7426000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TT-flag.gif"
    },
    {
        id: "TG",
        name: "Togo",
        background: "French Togoland became Togo in 1960. Gen. Gnassingbe EYADEMA, installed as military ruler in 1967, ruled Togo with a heavy hand for almost four decades. Despite the facade of multi-party elections instituted in the early 1990s, the government was largely dominated by President EYADEMA, whose Rally of the Togolese People (RPT) party has been in power almost continually since 1967 and its successor, the Union for the Republic, maintains a majority of seats in today's legislature. Upon EYADEMA's death in February 2005, the military installed the president's son, Faure GNASSINGBE, and then engineered his formal election two months later. Democratic gains since then allowed Togo to hold its first relatively free and fair legislative elections in October 2007. Since 2007, President GNASSINGBE has started the country along a gradual path to democratic reform. Togo has since held multiple presidential and legislative elections deemed generally free and fair by international observers. Despite those positive moves, political reconciliation has moved slowly, and the country experiences periodic outbursts of violent protest by frustrated citizens. Recent constitutional changes to institute a runoff system in presidential elections and establish term limits has done little to reduce the resentment many Togolese feel after over 50 years of one-family rule.",
        region: "Africa",
        capital: "Lome",
        "birth rate": 32,
        "death rate": 6.5,
        "population growth": 2.56,
        "labor force": 2595000,
        population: 8608444,
        "median age": 20,
        "GDP(PPP)": 12970000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TO-flag.gif"
    },
    {
        id: "TO",
        name: "Tonga",
        background: "Tonga - unique among Pacific nations - never completely lost its indigenous governance. The archipelagos of \"The Friendly Islands\" were united into a Polynesian kingdom in 1845. Tonga became a constitutional monarchy in 1875 and a British protectorate in 1900; it withdrew from the protectorate and joined the Commonwealth of Nations in 1970. Tonga remains the only monarchy in the Pacific; in 2008, King George TUPOU V announced he was relinquishing most of his powers leading up to parliamentary elections in 2010. TUPOU died in 2012 and was succeeded by his brother 'Aho'eitu TUPOU VI. Tropical Cyclone Gita, the strongest-ever recorded storm to impact Tonga, hit the islands in February 2018 causing extensive damage.",
        region: "Oceania",
        capital: "Nuku'alofa",
        "birth rate": 21,
        "death rate": 4.9,
        "population growth": -0.16,
        "labor force": 33800,
        population: 106095,
        "median age": 24.1,
        "GDP(PPP)": 591000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TN-flag.gif"
    },
    {
        id: "TT",
        name: "Trinidad and Tobago",
        background: "First colonized by the Spanish, the islands came under British control in the early 19th century. The islands' sugar industry was hurt by the emancipation of the slaves in 1834. Manpower was replaced with the importation of contract laborers from India between 1845 and 1917, which boosted sugar production as well as the cocoa industry. The discovery of oil on Trinidad in 1910 added another important export. Independence was attained in 1962. The country is one of the most prosperous in the Caribbean thanks largely to petroleum and natural gas production and processing. Tourism, mostly in Tobago, is targeted for expansion and is growing. The government is struggling to reverse a surge in violent crime.",
        region: "Central America & The Caribbean",
        capital: "Port of Spain",
        "birth rate": 11.4,
        "death rate": 9.1,
        "population growth": -0.3,
        "labor force": 629400,
        population: 1208789,
        "median age": 37.8,
        "GDP(PPP)": 42850000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TD-flag.gif"
    },
    {
        id: "TN",
        name: "Tunisia",
        background: "Rivalry between French and Italian interests in Tunisia culminated in a French invasion in 1881 and the creation of a protectorate. Agitation for independence in the decades following World War I was finally successful in convincing the French to recognize Tunisia as an independent state in 1956. The country's first president, Habib BOURGUIBA, established a strict one-party state. He dominated the country for 31 years, repressing Islamic fundamentalism and establishing rights for women unmatched by any other Arab nation. In November 1987, BOURGUIBA was removed from office and replaced by Zine el Abidine BEN ALI in a bloodless coup. Street protests that began in Tunis in December 2010 over high unemployment, corruption, widespread poverty, and high food prices escalated in January 2011, culminating in rioting that led to hundreds of deaths. On 14 January 2011, the same day BEN ALI dismissed the government, he fled the country, and by late January 2011, a \"national unity government\" was formed. Elections for the new Constituent Assembly were held in late October 2011, and in December, it elected human rights activist Moncef MARZOUKI as interim president. The Assembly began drafting a new constitution in February 2012 and, after several iterations and a months-long political crisis that stalled the transition, ratified the document in January 2014. Parliamentary and presidential elections for a permanent government were held at the end of 2014. Beji CAID ESSEBSI was elected as the first president under the country's new constitution. Following ESSEBSIs death in office in July 2019, Tunisia moved its scheduled presidential election forward two months and after two rounds of voting, Kais SAIED was sworn in as president in October 2019. Tunisia also held legislative elections on schedule in October 2019. SAIED's term, as well as that of Tunisia's 217-member parliament, expires in 2024.",
        region: "Africa",
        capital: "Tunis",
        "birth rate": 15.9,
        "death rate": 6.4,
        "population growth": 0.85,
        "labor force": 4054000,
        population: 11721177,
        "median age": 32.7,
        "GDP(PPP)": 137700000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TS-flag.gif"
    },
    {
        id: "TR",
        name: "Turkey",
        background: 'Modern Turkey was founded in 1923 from the remnants of the defeated Ottoman Empire by national hero Mustafa KEMAL, who was later honored with the title Ataturk or "Father of the Turks." Under his leadership, the country adopted radical social, legal, and political reforms. After a period of one-party rule, an experiment with multi-party politics led to the 1950 election victory of the opposition Democrat Party and the peaceful transfer of power. Since then, Turkish political parties have multiplied, but democracy has been fractured by periods of instability and military coups (1960, 1971, 1980), which in each case eventually resulted in a return of formal political power to civilians. In 1997, the military again helped engineer the ouster - popularly dubbed a "post-modern coup" - of the then Islamic-oriented government. An unsuccessful coup attempt was made in July 2016 by a faction of the Turkish Armed Forces.Turkey intervened militarily on Cyprus in 1974 to prevent a Greek takeover of the island and has since acted as patron state to the "Turkish Republic of Northern Cyprus," which only Turkey recognizes. A separatist insurgency begun in 1984 by the Kurdistan Workers\' Party (PKK), a US-designated terrorist organization, has long dominated the attention of Turkish security forces and claimed more than 40,000 lives. In 2013, the Turkish Government and the PKK conducted negotiations aimed at ending the violence, however intense fighting resumed in 2015. Turkey joined the UN in 1945 and in 1952 it became a member of NATO. In 1963, Turkey became an associate member of the European Community; it began accession talks with the EU in 2005. Over the past decade, economic reforms, coupled with some political reforms, have contributed to a growing economy, although economic growth slowed in recent years.From 2015 and continuing through 2016, Turkey witnessed an uptick in terrorist violence, including major attacks in Ankara, Istanbul, and throughout the predominantly Kurdish southeastern region of Turkey. On 15 July 2016, elements of the Turkish Armed forces attempted a coup that ultimately failed following widespread popular resistance. More than 240 people were killed and over 2,000 injured when Turkish citizens took to the streets en masse to confront the coup forces. The government accused followers of the Fethullah Gulen transnational religious and social movement ("Hizmet") for allegedly instigating the failed coup and designates the movements followers as terrorists. Since the attempted coup, Turkish Government authorities arrested, suspended, or dismissed more than 130,000 security personnel, journalists, judges, academics, and civil servants due to their alleged connection to Gulen\'s movement. Following the failed coup, the Turkish Government instituted a State of Emergency from July 2016 to July 2018. The Turkish Government conducted a referendum on 16 April 2017 in which voters approved constitutional amendments changing Turkey from a parliamentary to a presidential system. The amendments went into effect fully following the presidential and parliamentary elections in June 2018.',
        region: "Middle East",
        capital: "Ankara",
        "birth rate": 14.8,
        "death rate": 6.1,
        "population growth": 0.45,
        "labor force": 31300000,
        population: 82017514,
        "median age": 32.2,
        "GDP(PPP)": 2186000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TU-flag.gif"
    },
    {
        id: "TM",
        name: "Turkmenistan",
        background: "Present-day Turkmenistan covers territory that has been at the crossroads of civilizations for centuries. The area was ruled in antiquity by various Persian empires, and was conquered by Alexander the Great, Muslim armies, the Mongols, Turkic warriors, and eventually the Russians. In medieval times, Merv (located in present-day Mary province) was one of the great cities of the Islamic world and an important stop on the Silk Road. Annexed by Russia in the late 1800s, Turkmenistan later figured prominently in the anti-Bolshevik movement in Central Asia. In 1924, Turkmenistan became a Soviet republic; it achieved independence upon the dissolution of the USSR in 1991. President for Life Saparmyrat NYYAZOW died in December 2006, and Gurbanguly BERDIMUHAMEDOW, a deputy chairman under NYYAZOW, emerged as the country's new president.BERDIMUHAMEDOW won Turkmenistan's first multi-candidate presidential election in February 2007, and again in 2012 and in 2017 with over 97% of the vote in both instances, in elections widely regarded as undemocratic.Turkmenistan has sought new export markets for its extensive hydrocarbon/natural gas reserves, which have yet to be fully exploited. As of late 2019, Turkmenistan exported the majority of its gas to China and small levels of gas were also being sent to Russia. Turkmenistan's reliance on gas exports has made the economy vulnerable to fluctuations in the global energy market, and economic hardships since the drop in energy prices in 2014 have led many Turkmenistanis to emigrate, mostly to Turkey.",
        region: "Asia",
        capital: "Ashgabat",
        "birth rate": 18.3,
        "death rate": 6.1,
        "population growth": 1.06,
        "labor force": 2305000,
        population: 5528627,
        "median age": 29.2,
        "GDP(PPP)": 103700000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TX-flag.gif"
    },
    {
        id: "TC",
        name: "Turks and Caicos Islands",
        background: "The islands were part of the UK's Jamaican colony until 1962, when they assumed the status of a separate Crown colony upon Jamaica's independence. The governor of The Bahamas oversaw affairs from 1965 to 1973. With Bahamian independence, the islands received a separate governor in 1973. Although independence was agreed upon for 1982, the policy was reversed and the islands remain a British overseas territory. Grand Turk island suffered extensive damage from Hurricane Maria on 22 September 2017 resulting in loss of power and communications as well as damage to housing and businesses.",
        region: "Central America & The Caribbean",
        capital: "Grand Turk",
        "birth rate": 14.1,
        "death rate": 3.4,
        "population growth": 2,
        "labor force": 4848,
        population: 55926,
        "median age": 34.6,
        "GDP(PPP)": 632000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TK-flag.gif"
    },
    {
        id: "TV",
        name: "Tuvalu",
        background: 'In 1974, ethnic differences within the British colony of the Gilbert and Ellice Islands caused the Polynesians of the Ellice Islands to vote for separation from the Micronesians of the Gilbert Islands. The following year, the Ellice Islands became the separate British colony of Tuvalu. Independence was granted in 1978. In 2000, Tuvalu negotiated a contract leasing its Internet domain name ".tv" for $50 million in royalties over a 12-year period. The agreement was subsequently renegotiated but details were not disclosed. Tuvalu hosted the Pacific Islands Forum Leaders Meeting in August 2019.',
        region: "Oceania",
        capital: "Funafuti",
        "birth rate": 23.4,
        "death rate": 8.2,
        "population growth": 0.87,
        "labor force": 3615,
        population: 11342,
        "median age": 26.6,
        "GDP(PPP)": 42000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/TV-flag.gif"
    },
    {
        id: "UG",
        name: "Uganda",
        background: "The colonial boundaries created by Britain to delimit Uganda grouped together a wide range of ethnic groups with different political systems and cultures. These differences complicated the establishment of a working political community after independence was achieved in 1962. The dictatorial regime of Idi AMIN (1971-79) was responsible for the deaths of some 300,000 opponents; guerrilla war and human rights abuses under Milton OBOTE (1980-85) claimed at least another 100,000 lives. The rule of Yoweri MUSEVENI since 1986 has brought relative stability and economic growth to Uganda. In December 2017, parliament approved the removal of presidential age limits, thereby making it possible for MUSEVENI to continue standing for office. Uganda faces numerous challenges, however, that could affect future stability, including explosive population growth, power and infrastructure constraints, corruption, underdeveloped democratic institutions, and human rights deficits.",
        region: "Africa",
        capital: "Kampala",
        "birth rate": 42.3,
        "death rate": 5.3,
        "population growth": 3.34,
        "labor force": 15840000,
        population: 43252966,
        "median age": 15.7,
        "GDP(PPP)": 89190000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/UG-flag.gif"
    },
    {
        id: "UA",
        name: "Ukraine",
        background: "Ukraine was the center of the first eastern Slavic state, Kyivan Rus, which during the 10th and 11th centuries was the largest and most powerful state in Europe. Weakened by internecine quarrels and Mongol invasions, Kyivan Rus was incorporated into the Grand Duchy of Lithuania and eventually into the Polish-Lithuanian Commonwealth. The cultural and religious legacy of Kyivan Rus laid the foundation for Ukrainian nationalism through subsequent centuries. A new Ukrainian state, the Cossack Hetmanate, was established during the mid-17th century after an uprising against the Poles. Despite continuous Muscovite pressure, the Hetmanate managed to remain autonomous for well over 100 years. During the latter part of the 18th century, most Ukrainian ethnographic territory was absorbed by the Russian Empire. Following the collapse of czarist Russia in 1917, Ukraine achieved a short-lived period of independence (1917-20), but was reconquered and endured a brutal Soviet rule that engineered two forced famines (1921-22 and 1932-33) in which over 8 million died. In World War II, German and Soviet armies were responsible for 7 to 8 million more deaths. Although Ukraine achieved independence in 1991 with the dissolution of the USSR, democracy and prosperity remained elusive as the legacy of state control and endemic corruption stalled efforts at economic reform, privatization, and civil liberties.A peaceful mass protest referred to as the \"Orange Revolution\" in the closing months of 2004 forced the authorities to overturn a rigged presidential election and to allow a new internationally monitored vote that swept into power a reformist slate under Viktor YUSHCHENKO. Subsequent internal squabbles in the YUSHCHENKO camp allowed his rival Viktor YANUKOVYCH to stage a comeback in parliamentary (Rada) elections, become prime minister in August 2006, and be elected president in February 2010. In October 2012, Ukraine held Rada elections, widely criticized by Western observers as flawed due to use of government resources to favor ruling party candidates, interference with media access, and harassment of opposition candidates. President YANUKOVYCH's backtracking on a trade and cooperation agreement with the EU in November 2013 - in favor of closer economic ties with Russia - and subsequent use of force against students, civil society activists, and other civilians in favor of the agreement led to a three-month protest occupation of Kyiv's central square. The government's use of violence to break up the protest camp in February 2014 led to all out pitched battles, scores of deaths, international condemnation, a failed political deal, and the president's abrupt departure for Russia. New elections in the spring allowed pro-West president Petro POROSHENKO to assume office in June 2014; he was succeeded by Volodymyr ZELENSKY in May 2019.Shortly after YANUKOVYCH's departure in late February 2014, Russian President PUTIN ordered the invasion of Ukraine's Crimean Peninsula falsely claiming the action was to protect ethnic Russians living there. Two weeks later, a \"referendum\" was held regarding the integration of Crimea into the Russian Federation. The \"referendum\" was condemned as illegitimate by the Ukrainian Government, the EU, the US, and the UN General Assembly (UNGA). In response to Russia's illegal annexation of Crimea, 100 members of the UN passed UNGA resolution 68/262, rejecting the \"referendum\" as baseless and invalid and confirming the sovereignty, political independence, unity, and territorial integrity of Ukraine. In mid-2014, Russia began supplying proxies in two of Ukraine's eastern provinces with manpower, funding, and materiel driving an armed conflict with the Ukrainian Government that continues to this day. Representatives from Ukraine, Russia, and the unrecognized Russian proxy republics signed the Minsk Protocol and Memorandum in September 2014 to end the conflict. However, this agreement failed to stop the fighting or find a political solution. In a renewed attempt to alleviate ongoing clashes, leaders of Ukraine, Russia, France, and Germany negotiated a follow-on Package of Measures in February 2015 to implement the Minsk agreements. Representatives from Ukraine, Russia, the unrecognized Russian proxy republics, and the Organization for Security and Cooperation in Europe also meet regularly to facilitate implementation of the peace deal. More than 13,000 civilians have been killed or wounded as a result of the Russian intervention in eastern Ukraine.",
        region: "Europe",
        capital: "Kyiv",
        "birth rate": 9.6,
        "death rate": 14,
        "population growth": -0.1,
        "labor force": 17990000,
        population: 43922939,
        "median age": 41.2,
        "GDP(PPP)": 369600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/UP-flag.gif"
    },
    {
        id: "AE",
        name: "United Arab Emirates",
        background: "The Trucial States of the Persian Gulf coast granted the UK control of their defense and foreign affairs in 19th century treaties. In 1971, six of these states - Abu Dhabi, 'Ajman, Al Fujayrah, Ash Shariqah, Dubayy, and Umm al Qaywayn - merged to form the United Arab Emirates (UAE). They were joined in 1972 by Ra's al Khaymah. The UAE's per capita GDP is on par with those of leading West European nations. For more than three decades, oil and global finance drove the UAE's economy. In 2008-09, the confluence of falling oil prices, collapsing real estate prices, and the international banking crisis hit the UAE especially hard. The UAE did not experience the \"Arab Spring\" unrest seen elsewhere in the Middle East in 2010-11, partly because of the government's multi-year, $1.6-billion infrastructure investment plan for the poorer northern emirates, and its aggressive pursuit of advocates of political reform. The UAE in recent years has played a growing role in regional affairs. In addition to donating billions of dollars in economic aid to help stabilize Egypt, the UAE was one of the first countries to join the Defeat-ISIS coalition, and to participate as a key partner in a Saudi-led military campaign in Yemen.",
        region: "Middle East",
        capital: "Abu Dhabi",
        "birth rate": 9.5,
        "death rate": 2,
        "population growth": 1.49,
        "labor force": 5344000,
        population: 9992083,
        "median age": 38.4,
        "GDP(PPP)": 696000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/AE-flag.gif"
    },
    {
        id: "GB",
        name: "United Kingdom",
        background: "The United Kingdom has historically played a leading role in developing parliamentary democracy and in advancing literature and science. At its zenith in the 19th century, the British Empire stretched over one-fourth of the earth's surface. The first half of the 20th century saw the UK's strength seriously depleted in two world wars and the Irish Republic's withdrawal from the union. The second half witnessed the dismantling of the Empire and the UK rebuilding itself into a modern and prosperous European nation. As one of five permanent members of the UN Security Council and a founding member of NATO and the Commonwealth, the UK pursues a global approach to foreign policy. The Scottish Parliament, the National Assembly for Wales, and the Northern Ireland Assembly were established in 1998.The UK has been an active member of the EU since its accession in 1973, although it chose to remain outside the Economic and Monetary Union. However, motivated in part by frustration at a remote bureaucracy in Brussels and massive migration into the country, UK citizens on 23 June 2016 narrowly voted to leave the EU. The UK is scheduled to depart the EU on 31 January 2020, but negotiations on the future EU-UK economic and security relationship will continue throughout 2020 and potentially beyond.",
        region: "Europe",
        capital: "London",
        "birth rate": 11.9,
        "death rate": 9.5,
        "population growth": 0.49,
        "labor force": 33500000,
        population: 65761117,
        "median age": 40.6,
        "GDP(PPP)": 2925000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/UK-flag.gif"
    },
    {
        id: "US",
        name: "United States",
        background: "Britain's American colonies broke with the mother country in 1776 and were recognized as the new nation of the United States of America following the Treaty of Paris in 1783. During the 19th and 20th centuries, 37 new states were added to the original 13 as the nation expanded across the North American continent and acquired a number of overseas possessions. The two most traumatic experiences in the nation's history were the Civil War (1861-65), in which a northern Union of states defeated a secessionist Confederacy of 11 southern slave states, and the Great Depression of the 1930s, an economic downturn during which about a quarter of the labor force lost its jobs. Buoyed by victories in World Wars I and II and the end of the Cold War in 1991, the US remains the world's most powerful nation state. Since the end of World War II, the economy has achieved relatively steady growth, low unemployment and inflation, and rapid advances in technology.",
        region: "North America",
        capital: "Washington, DC",
        "birth rate": 12.4,
        "death rate": 8.3,
        "population growth": 0.72,
        "labor force": 160400000,
        population: 332639102,
        "median age": 38.5,
        "GDP(PPP)": 19490000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/US-flag.gif"
    },
    {
        id: "UY",
        name: "Uruguay",
        background: "Montevideo, founded by the Spanish in 1726 as a military stronghold, soon took advantage of its natural harbor to become an important commercial center. Claimed by Argentina but annexed by Brazil in 1821, Uruguay declared its independence four years later and secured its freedom in 1828 after a three-year struggle. The administrations of President Jose BATLLE in the early 20th century launched widespread political, social, and economic reforms that established a statist tradition. A violent Marxist urban guerrilla movement named the Tupamaros, launched in the late 1960s, led Uruguay's president to cede control of the government to the military in 1973. By yearend, the rebels had been crushed, but the military continued to expand its hold over the government. Civilian rule was restored in 1985. In 2004, the left-of-center Frente Amplio Coalition won national elections that effectively ended 170 years of political control previously held by the Colorado and National (Blanco) parties. Uruguay's political and labor conditions are among the freest on the continent.",
        region: "South America",
        capital: "Montevideo",
        "birth rate": 12.9,
        "death rate": 9.3,
        "population growth": 0.27,
        "labor force": 1748000,
        population: 3387605,
        "median age": 35.5,
        "GDP(PPP)": 78160000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/UY-flag.gif"
    },
    {
        id: "UZ",
        name: "Uzbekistan",
        background: 'Uzbekistan is the geographic and population center of Central Asia. The country has a diverse economy and a relatively young population. Russia conquered and united the disparate territories of present-day Uzbekistan in the late 19th century. Stiff resistance to the Red Army after the Bolshevik Revolution was eventually suppressed and a socialist republic established in 1924. During the Soviet era, intensive production of "white gold" (cotton) and grain led to the overuse of agrochemicals and the depletion of water supplies, leaving the land degraded and the Aral Sea and certain rivers half-dry. Independent since the dissolution of the USSR in 1991, the country has diversified agricultural production while developing its mineral and petroleum export capacity and increasing its manufacturing base, although cotton remains a major part of its economy. Uzbekistans first president, Islam KARIMOV, led Uzbekistan for 25 years until his death in September 2016. His successor, former Prime Minister Shavkat MIRZIYOYEV, has improved relations with Uzbekistans neighbors and introduced wide-ranging economic, judicial, and social reforms.',
        region: "Asia",
        capital: "Tashkent",
        "birth rate": 16.1,
        "death rate": 5.4,
        "population growth": 0.88,
        "labor force": 18120000,
        population: 30565411,
        "median age": 30.1,
        "GDP(PPP)": 223000000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/UZ-flag.gif"
    },
    {
        id: "VU",
        name: "Vanuatu",
        background: "Multiple waves of colonizers, each speaking a distinct language, migrated to the New Hebrides in the millennia preceding European exploration in the 18th century. This settlement pattern accounts for the complex linguistic diversity found on the archipelago to this day. The British and French, who settled the New Hebrides in the 19th century, agreed in 1906 to an Anglo-French Condominium, which administered the islands until independence in 1980, when the new name of Vanuatu was adopted. Politics and society continue to be divided along linguistic lines, although those divisions are lessening over time. Coalition governments tend to be weak, and since 2008, prime ministers have been ousted through no-confidence motions or temporary procedural issues 10 times. Prime Minister Charlot SALAWI has survived at least five no-confidence motions since taking office in 2016.",
        region: "Oceania",
        capital: "Port-Vila",
        "birth rate": 22.4,
        "death rate": 4,
        "population growth": 1.73,
        "labor force": 115900,
        population: 298333,
        "median age": 23,
        "GDP(PPP)": 772000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/NH-flag.gif"
    },
    {
        id: "VE",
        name: "Venezuela",
        background: "Venezuela was one of three countries that emerged from the collapse of Gran Colombia in 1830 (the others being Ecuador and New Granada, which became Colombia). For most of the first half of the 20th century, Venezuela was ruled by generally benevolent military strongmen who promoted the oil industry and allowed for some social reforms. Democratically elected governments have held sway since 1959, although the re-election of current disputed President Nicolas MADURO in an election boycotted by most opposition parties was widely viewed as fraudulent. Under Hugo CHAVEZ, president from 1999 to 2013, and his hand-picked successor, MADURO, the executive branch has exercised increasingly authoritarian control over other branches of government. National Assembly President Juan GUAIDO is currently recognized by more than 50 countries - including the United States - as the interim president while MADURO retains control of all other institutions within the country and has the support of security forces. Venezuela is currently authoritarian with only one democratic institution - the National Assembly - and strong restrictions on freedoms of expression and the press. The ruling party's economic policies expanded the state's role in the economy through expropriations of major enterprises, strict currency exchange and price controls that discourage private sector investment and production, and overdependence on the petroleum industry for revenues, among others. However, Caracas in 2019 relaxed some economic controls to mitigate some impacts of the economic crisis driven by a drop in oil production. Current concerns include human rights abuses, rampant violent crime, high inflation, and widespread shortages of basic consumer goods, medicine, and medical supplies.",
        region: "South America",
        capital: "Caracas",
        "birth rate": 17.9,
        "death rate": 7.5,
        "population growth": -0.18,
        "labor force": 14210000,
        population: 28644603,
        "median age": 30,
        "GDP(PPP)": 381600000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/VE-flag.gif"
    },
    {
        id: "VN",
        name: "Vietnam",
        background: 'The conquest of Vietnam by France began in 1858 and was completed by 1884. It became part of French Indochina in 1887. Vietnam declared independence after World War II, but France continued to rule until its 1954 defeat by communist forces under Ho Chi MINH. Under the Geneva Accords of 1954, Vietnam was divided into the communist North and anti-communist South. US economic and military aid to South Vietnam grew through the 1960s in an attempt to bolster the government, but US armed forces were withdrawn following a cease-fire agreement in 1973. Two years later, North Vietnamese forces overran the South reuniting the country under communist rule. Despite the return of peace, for over a decade the country experienced little economic growth because of conservative leadership policies, the persecution and mass exodus of individuals - many of them successful South Vietnamese merchants - and growing international isolation. However, since the enactment of Vietnam\'s "doi moi" (renovation) policy in 1986, Vietnamese authorities have committed to increased economic liberalization and enacted structural reforms needed to modernize the economy and to produce more competitive, export-driven industries. The communist leaders maintain tight control on political expression but have demonstrated some modest steps toward better protection of human rights. The country continues to experience small-scale protests, the vast majority connected to either land-use issues, calls for increased political space, or the lack of equitable mechanisms for resolving disputes. The small-scale protests in the urban areas are often organized by human rights activists, but many occur in rural areas and involve various ethnic minorities such as the Montagnards of the Central Highlands, Hmong in the Northwest Highlands, and the Khmer Krom in the southern delta region.',
        region: "Asia",
        capital: "Hanoi",
        "birth rate": 14.5,
        "death rate": 6,
        "population growth": 0.84,
        "labor force": 54800000,
        population: 98721275,
        "median age": 31.9,
        "GDP(PPP)": 648700000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/VM-flag.gif"
    },
    {
        id: "VI",
        name: "Virgin Islands",
        background: "The Danes secured control over the southern Virgin Islands of Saint Thomas, Saint John, and Saint Croix during the 17th and early 18th centuries. Sugarcane, produced by African slave labor, drove the islands' economy during the 18th and early 19th centuries. In 1917, the US purchased the Danish holdings, which had been in economic decline since the abolition of slavery in 1848. On 6 September 2017, Hurricane Irma passed over the northern Virgin Islands of Saint Thomas and Saint John and inflicted severe damage to structures, roads, the airport on Saint Thomas, communications, and electricity. Less than two weeks later, Hurricane Maria passed over the island of Saint Croix in the southern Virgin Islands, inflicting considerable damage with heavy winds and flooding rains.",
        region: "Central America & The Caribbean",
        capital: "CharlotteAmalie",
        "birth rate": 12.1,
        "death rate": 8.5,
        "population growth": -0.37,
        "labor force": 48550,
        population: 106235,
        "median age": 41.8,
        "GDP(PPP)": 3872000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/VQ-flag.gif"
    },
    {
        id: "WF",
        name: "Wallis and Futuna",
        background: "The Futuna island group was discovered by the Dutch in 1616 and Wallis by the British in 1767, but it was the French who declared a protectorate over the islands in 1842, and took official control of them between 1886 and 1888. Notably, Wallis and Futuna was the only French colony to side with the Vichy regime during World War II, a phase that ended in May of 1942 with the arrival of 2,000 American troops. In 1959, the inhabitants of the islands voted to become a French overseas territory and officially assumed that status in 1961. In 2003, Wallis and Futuna's designation changed to that of an overseas collectivity.",
        region: "Oceania",
        capital: "Mata-Utu",
        "birth rate": 12.7,
        "death rate": 5.7,
        "population growth": 0.28,
        "labor force": 4482,
        population: 15854,
        "median age": 34,
        "GDP(PPP)": 60000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/WF-flag.gif"
    },
    {
        id: "PS",
        name: "Palestine",
        background: "Inhabited since at least the 15th century B.C., the West Bank has been dominated by many different peoples throughout its history; it was incorporated into the Ottoman Empire in the early 16th century. The West Bank fell to British forces during World War I, becoming part of the British Mandate of Palestine. Following the 1948 Arab-Israeli War, the West Bank was captured by Transjordan (later renamed Jordan), which annexed the West Bank in 1950; it was captured by Israel in the Six-Day War in 1967. Under a series of agreements known as the Oslo accords signed between 1993 and 1999, Israel transferred to the newly created Palestinian Authority (PA) security and civilian responsibility for many Palestinian-populated areas of the West Bank as well as the Gaza Strip. In 2000, a violent intifada or uprising began, and in 2001 negotiations to determine the permanent status of the West Bank and Gaza Strip stalled. Subsequent attempts to re-start direct negotiations have not resulted in progress toward determining final status of the area.Roughly 60% of the West Bank, remains under Israeli civil and military control. In early 2006, the Islamic Resistance Movement (HAMAS) won a majority in the Palestinian Legislative Council (PLC) election. Attempts to form a unity government between Fatah, the dominant Palestinian political faction in the West Bank, and HAMAS failed, leading to violent clashed between their respective supporters and HAMAS's violent siezure of all military and governmental institutions in the Gaza Strip in June 2007. Since 2007, the PA has administered parts of the West Bank under its control, mainly the major Palestinian population centers and areas immediately surrounding them. Fatah and HAMAS have made several attempts at reconciliation, but the factions have been unable to implement agreements including the latest agreement signed in October 2017. In December 2018, the Palestinian Constitutional Court dissolved the PLC. In 2019, PA President ABBAS renewed his calls for PLC elections.",
        region: "Middle East",
        capital: "East Jerusalem",
        "birth rate": 25.2,
        "death rate": 3.4,
        "population growth": 1.77,
        "labor force": 1240000,
        population: 2900034,
        "median age": 21.9,
        "GDP(PPP)": 21220000000,
        score: 0,
        flag: "https://flaglane.com/download/palestinian-flag/palestinian-flag-medium.gif"
    },
    {
        id: "EH",
        name: "Western Sahara",
        background: "Western Sahara is a non-self-governing territory on the northwest coast of Africa bordered by Morocco, Mauritania, and Algeria. After Spain withdrew from its former colony of Spanish Sahara in 1976, Morocco annexed the northern two-thirds of Western Sahara and claimed the rest of the territory in 1979, following Mauritania's withdrawal. A guerrilla war with the Polisario Front contesting Morocco's sovereignty ended in a 1991 cease-fire and the establishment of a UN peacekeeping operation. As part of this effort, the UN sought to offer a choice to the peoples of Western Sahara between independence (favored by the Polisario Front) or integration into Morocco. A proposed referendum on the question of independence never took place due to lack of agreement on voter eligibility. The approximately 1,600 km- (almost 1,000 mi-) long defensive sand berm, built by the Moroccans from 1980 to 1987 and running the length of the territory, continues to separate the opposing forces, with Morocco controlling the roughly three-quarters of the territory west of the berm. There are periodic ethnic tensions between the native Sahrawi population and Moroccan immigrants. Morocco maintains a heavy security presence in the territory. The UN revived direct talks about the territory between Morocco, the Polisario Front, Algeria, and Mauritania in December 2018.",
        region: "Africa",
        capital: "Laayoune",
        "birth rate": 28,
        "death rate": 7.7,
        "population growth": 2.54,
        "labor force": 144000,
        population: 652271,
        "median age": 21.8,
        "GDP(PPP)": 906500000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/WI-flag.gif"
    },
    {
        id: "YE",
        name: "Yemen",
        background: "The Kingdom of Yemen (colloquially known as North Yemen) became independent from the Ottoman Empire in 1918 and in 1962 became the Yemen Arab Republic. The British, who had set up a protectorate area around the southern port of Aden in the 19th century, withdrew in 1967 from what became the People's Republic of Southern Yemen (colloquially known as South Yemen). Three years later, the southern government adopted a Marxist orientation and changed the country's name to the People's Democratic Republic of Yemen. The massive exodus of hundreds of thousands of Yemenis from the south to the north contributed to two decades of hostility between the states. The two countries were formally unified as the Republic of Yemen in 1990. A southern secessionist movement and brief civil war in 1994 was quickly subdued. In 2000, Saudi Arabia and Yemen agreed to delineate their border.Fighting in the northwest between the government and the Huthis, a Zaydi Shia Muslim minority, continued intermittently from 2004 to 2010, and then again from 2014-present. The southern secessionist movement was revitalized in 2007.Public rallies in Sana'a against then President Ali Abdallah SALIH - inspired by similar demonstrations in Tunisia and Egypt - slowly built momentum starting in late January 2011 fueled by complaints over high unemployment, poor economic conditions, and corruption. By the following month, some protests had resulted in violence, and the demonstrations had spread to other major cities. By March the opposition had hardened its demands and was unifying behind calls for SALIH's immediate ouster. In April 2011, the Gulf Cooperation Council (GCC), in an attempt to mediate the crisis in Yemen, proposed the GCC Initiative, an agreement in which the president would step down in exchange for immunity from prosecution. SALIH's refusal to sign an agreement led to further violence. The UN Security Council passed Resolution 2014 in October 2011 calling for an end to the violence and completing a power transfer deal. In November 2011, SALIH signed the GCC Initiative to step down and to transfer some of his powers to Vice President Abd Rabuh Mansur HADI. Following HADI's uncontested election victory in February 2012, SALIH formally transferred all presidential powers. In accordance with the GCC Initiative, Yemen launched a National Dialogue Conference (NDC) in March 2013 to discuss key constitutional, political, and social issues. HADI concluded the NDC in January 2014 and planned to begin implementing subsequent steps in the transition process, including constitutional drafting, a constitutional referendum, and national elections.The Huthis, perceiving their grievances were not addressed in the NDC, joined forces with SALIH and expanded their influence in northwestern Yemen, which culminated in a major offensive against military units and rival tribes and enabled their forces to overrun the capital, Sanaa, in September 2014. In January 2015, the Huthis surrounded the presidential palace, HADI's residence, and key government facilities, prompting HADI and the cabinet to submit their resignations. HADI fled to Aden in February 2015 and rescinded his resignation. He subsequently escaped to Oman and then moved to Saudi Arabia and asked the GCC to intervene militarily in Yemen to protect the legitimate government from the Huthis. In March, Saudi Arabia assembled a coalition of Arab militaries and began airstrikes against the Huthis and Huthi-affiliated forces. Ground fighting between Huthi-aligned forces and anti-Huthi groups backed by the Saudi-led coalition continued through 2016. In 2016, the UN brokered a months-long cessation of hostilities that reduced airstrikes and fighting, and initiated peace talks in Kuwait. However, the talks ended without agreement. The Huthis and SALIHs political party announced a Supreme Political Council in August 2016 and a National Salvation Government, including a prime minister and several dozen cabinet members, in November 2016, to govern in Sanaa and further challenge the legitimacy of HADIs government. However, amid rising tensions between the Huthis and SALIH, sporadic clashes erupted in mid-2017, and escalated into open fighting that ended when Huthi forces killed SALIH in early December 2017. In 2018, anti-Huthi forces made the most battlefield progress in Yemen since early 2016, most notably in Al Hudaydah Governorate. In December 2018, the Huthis and Yemeni Government participated in the first UN-brokered peace talks since 2016, agreeing to a limited ceasefire in Al Hudaydah Governorate and the establishment of a UN Mission to monitor the agreement. In April 2019, Yemens parliament convened in Say'un for the first time since the conflict broke out in 2014. In August 2019, violence erupted between HADI's government and the pro-secessionist Southern Transition Council (STC) in southern Yemen. In November 2019, HADI's government and the STC signed a power-sharing agreement to end the fighting between them.",
        region: "Middle East",
        capital: "Sanaa",
        "birth rate": 25.8,
        "death rate": 5.6,
        "population growth": 2.04,
        "labor force": 7425000,
        population: 29884405,
        "median age": 19.8,
        "GDP(PPP)": 73630000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/YM-flag.gif"
    },
    {
        id: "ZM",
        name: "Zambia",
        background: "Multiple waves of Bantu-speaking groups moved into and through what is now Zambia over the past thousand years. In the 1880s, the British began securing mineral and other economic concessions from various local leaders and the territory that is now Zambia eventually came under the control of the former British South Africa Company and was incorporated as the protectorate of Northern Rhodesia in 1911. Administrative control was taken over by the UK in 1924. During the 1920s and 1930s, advances in mining spurred development and immigration. The name was changed to Zambia upon independence in 1964. In the 1980s and 1990s, declining copper prices, economic mismanagement, and a prolonged drought hurt the economy. Elections in 1991 brought an end to one-party rule and propelled the Movement for Multiparty Democracy (MMD) to government. The subsequent vote in 1996, however, saw increasing harassment of opposition parties and abuse of state media and other resources. The election in 2001 was marked by administrative problems, with three parties filing a legal petition challenging the election of ruling party candidate Levy MWANAWASA. MWANAWASA was reelected in 2006 in an election that was deemed free and fair. Upon his death in August 2008, he was succeeded by his vice president, Rupiah BANDA, who won a special presidential byelection later that year. The MMD and BANDA lost to the Patriotic Front (PF) and Michael SATA in the 2011 general elections. SATA, however, presided over a period of haphazard economic management and attempted to silence opposition to PF policies. SATA died in October 2014 and was succeeded by his vice president, Guy SCOTT, who served as interim president until January 2015, when Edgar LUNGU won the presidential byelection and completed SATA's term. LUNGU then won a full term in August 2016 presidential elections.",
        region: "Africa",
        capital: "Lusaka",
        "birth rate": 40.4,
        "death rate": 11.6,
        "population growth": 2.89,
        "labor force": 6898000,
        population: 17426623,
        "median age": 16.9,
        "GDP(PPP)": 68930000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/ZA-flag.gif"
    },
    {
        id: "ZW",
        name: "Zimbabwe",
        background: "The UK annexed Southern Rhodesia from the former British South Africa Company in 1923. A 1961 constitution was formulated that favored whites in power. In 1965 the government unilaterally declared its independence, but the UK did not recognize the act and demanded more complete voting rights for the black African majority in the country (then called Rhodesia). UN sanctions and a guerrilla uprising finally led to free elections in 1979 and independence (as Zimbabwe) in 1980. Robert MUGABE, the nation's first prime minister, was the country's only ruler (as president since 1987) from independence until his resignation in November 2017. His chaotic land redistribution campaign, which began in 1997 and intensified after 2000, caused an exodus of white farmers, crippled the economy, and ushered in widespread shortages of basic commodities. Ignoring international condemnation, MUGABE rigged the 2002 presidential election to ensure his reelection.In 2005, the capital city of Harare embarked on Operation Restore Order, ostensibly an urban rationalization program, which resulted in the destruction of the homes or businesses of 700,000 mostly poor supporters of the opposition. MUGABE in 2007 instituted price controls on all basic commodities causing panic buying and leaving store shelves empty for months. General elections held in March 2008 contained irregularities but still amounted to a censure of the ZANU-PF-led government with the opposition winning a majority of seats in parliament. Movement for Democratic Change - Tsvangirai opposition leader Morgan TSVANGIRAI won the most votes in the presidential poll, but not enough to win outright. In the lead up to a run-off election in June 2008, considerable violence against opposition party members led to the withdrawal of TSVANGIRAI from the ballot. Extensive evidence of violence and intimidation resulted in international condemnation of the process. Difficult negotiations over a power-sharing \"government of national unity,\" in which MUGABE remained president and TSVANGIRAI became prime minister, were finally settled in February 2009, although the leaders failed to agree upon many key outstanding governmental issues. MUGABE was reelected president in 2013 in balloting that was severely flawed and internationally condemned. As a prerequisite to holding the election, Zimbabwe enacted a new constitution by referendum, although many provisions in the new constitution have yet to be codified in law. In November 2017, Vice President Emmerson MNANGAGWA took over following a military intervention that forced MUGABE to resign. MNANGAGWA was inaugurated president days later, promising to hold presidential elections in 2018. In July 2018, MNANGAGWA won the presidential election after a close contest with Movement for Democratic Change Alliance candidate Nelson CHAMISA. MNANGAGWA has since resorted to the government's longstanding practice of violently disrupting protests or opposition rallies. Official inflation rates soared in 2019, approaching 500% by the end of the year. MUGABE died in September 2019.",
        region: "Africa",
        capital: "Harare",
        "birth rate": 33.6,
        "death rate": 9.3,
        "population growth": 1.87,
        "labor force": 7907000,
        population: 14546314,
        "median age": 20.5,
        "GDP(PPP)": 34270000000,
        score: 0,
        flag: "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/ZI-flag.gif"
    }
];
// country data
polygonSeries.data = JSON.parse(JSON.stringify(worldData));
// polygonSeries.dataFields.value = "population";
polygonSeries.heatRules.push({
    property: "fill",
    target: polygonSeries.mapPolygons.template,
    min: am4core.color("#43a11f"),
    max: am4core.color("#43a11f")
});
// excludes Antarctica
//polygonSeries.exclude = ["AQ"];
polygonSeries.calculateVisualCenter = true;
var imageSeries = chart.series.push(new am4maps.MapImageSeries());
var imageSeriesTemplate = imageSeries.mapImages.template;
var marker = imageSeriesTemplate.createChild(am4core.Image);
marker.width = 28;
marker.height = 28;
marker.nonScaling = false;
marker.tooltipText = "{title}";
marker.horizontalCenter = "middle";
marker.verticalCenter = "middle";
marker.propertyFields.href = "flag";
imageSeriesTemplate.propertyFields.latitude = "latitude";
imageSeriesTemplate.propertyFields.longitude = "longitude";
var flagData = null;
polygonSeries.events.once("inited", function () {
    var imageData = [];
    polygonSeries.mapPolygons.each(function (polygon) {
        let cData = polygon.dataItem.dataContext;
        let cflagData = {
            latitude: polygon.visualLatitude,
            longitude: polygon.visualLongitude,
            title: polygon.dataItem.dataContext.name,
            flag: polygon.dataItem.dataContext.flag
        };
        imageData.push(cflagData);
    });
    flagData = imageData;
});
//imageSeries.data = [{"latitude": 48.8, "longitude": 2.3, "title": "Paris", "flag": "https://www.cia.gov/library/publications/the-world-factbook/attachments/flags/FR-flag.gif"}]
polygonTemplate.events.on("hit", function (ev) {
    if (qDisplay.disabled) {
        chart.closeAllPopups();
        var data = ev.target.dataItem.dataContext;
        //var info = document.getElementById("info");
        //info.innerHTML = "<h3>" + data.name + " (" + data.id  + ")</h3>";
        if (data.background) {
            //info.innerHTML += data.background;
            let modal = chart.openModal("<img src=" +
                data.flag +
                ' style="width:128px;height:64px;">' +
                '<strong><p style="font-size:10px">' +
                data.name +
                " (" +
                data.id +
                ")" +
                "</p></strong>" +
                data.background +
                '<a href="https://en.wikipedia.org/wiki/' +
                data.name.replace(" ", "_") +
                '"target="_blank">More info</a>', data.name);
            modal.showCurtain = true;
        }
    }
});
let hs = polygonTemplate.states.create("hover");
hs.properties.fill = chart.colors.getIndex(0).brighten(-0.5);
function menuSelections(num) {
    dataGroups.disabled = true;
    settings.disabled = true;
    testChoices.disabled = true;
    triviaGroup.disabled = true;
    geoGroup.disabled = true;
    qDisplay.disabled = true;
    scoreDisplay.disabled = true;
    
	switch (num) {
        case 0:
            heatLegend.disabled = true;
            colorGroup.disabled = true;
            break;
        case 1:
            dataGroups.disabled = false;
            heatLegend.disabled = false;
            colorGroup.disabled = false;
            break;
        case 2:
            settings.disabled = false;
            break;
        case 3:
            triviaGroup.disabled = false;
            testButton.disabled = false;
            heatLegend.disabled = true;
            colorGroup.disabled = true;
            if (flagMode) {
                imageSeries.hidden = true;
                imageSeries.data = null;
                flagMode = false;
            }
            break;
        case 4:
            heatLegend.disabled = true;
            colorGroup.disabled = true;
            geoGroup.disabled = false;
            if (flagMode) {
                imageSeries.hidden = true;
                imageSeries.data = null;
                flagMode = false;
            }
            break;
        case 5:
            heatLegend.disabled = false;
            colorGroup.disabled = true;
    }
}
let menuGroup = chart.createChild(am4core.Container);
menuGroup.isMeasured = false;
menuGroup.layout = "vertical";
menuGroup.x = am4core.percent(95);
menuGroup.y = am4core.percent(60);
menuGroup.horizontalCenter = "middle";
// let plainMapSelect = menuGroup.createChild(am4core.TextLink);
// plainMapSelect.margin(-50, 10, 10, 10);
// plainMapSelect.text = "Plain Map";
// plainMapSelect.events.on("hit", function () {
//     menuSelections(0);
//     polygonSeries.heatRules.push({
//         property: "fill",
//         target: polygonSeries.mapPolygons.template,
//         min: am4core.color("#43a11f"),
//         max: am4core.color("#43a11f")
//     });
//     // title.text = "Interactive Map";
//     tipMode = 3;
//     polygonSeries.invalidateData();
// });
// let heatmapSelect = menuGroup.createChild(am4core.TextLink);
// heatmapSelect.margin(10, 10, 10, 10);
// heatmapSelect.text = "Population Map";
// heatmapSelect.events.on("hit", function () {
//     if (dataGroups.disabled) {
//         // title.text = "Population";
//         tipMode = 0;
//         polygonSeries.heatRules.push({
//             property: "fill",
//             target: polygonSeries.mapPolygons.template,
//             min: am4core.color("#ffffff"),
//             max: am4core.color("#e84646")
//         });
//         polygonSeries.dataItems.each(function (dataItem) {
//             if (dataItem.dataContext)
//                 dataItem.setValue("value", dataItem.dataContext.population);
//         });
//     }
//     menuSelections(1);
//     polygonSeries.invalidateData();
// });
// let settingsSelect = menuGroup.createChild(am4core.TextLink);
// settingsSelect.margin(10, 10, 10, 10);
// settingsSelect.text = "Settings";
// settingsSelect.events.on("hit", function () {
//     menuSelections(2);
// });
// let triviaSelect = menuGroup.createChild(am4core.TextLink);
// triviaSelect.margin(10, 10, 10, 10);
// triviaSelect.text = "Data Quiz";
// triviaSelect.events.on("hit", function () {
//     menuSelections(3);
// });
var toggleNA = true;
var toggleSA = true;
var toggleEU = true;
var toggleAS = true;
var toggleAF = true;
var toggleME = true;
var toggleCA = false;
var toggleOC = false;
// let geographySelect = menuGroup.createChild(am4core.TextLink);
// geographySelect.margin(10, 10, 10, 10);
// geographySelect.text = "Geography Quiz";
// geographySelect.events.on("hit", function () {
//     menuSelections(4);
//     title.text = "";
//     tipMode = 3;
//     toggleRegion(toggleNA, "North America");
//     toggleRegion(toggleSA, "South America");
//     toggleRegion(toggleCA, "Central America & The Caribbean");
//     toggleRegion(toggleEU, "Europe");
//     toggleRegion(toggleAS, "Asia");
//     toggleRegion(toggleME, "Middle East");
//     toggleRegion(toggleOC, "Oceania");
//     toggleRegion(toggleAF, "Africa");
// });
function toggleRegion(bool, region) {
    if (bool) {
        polygonSeries.mapPolygons.each(function (mapPolygon) {
            if (mapPolygon.dataItem.dataContext &&
                mapPolygon.dataItem.dataContext["region"] == region)
                mapPolygon.setState("active");
        });
    }
    else {
        polygonSeries.mapPolygons.each(function (mapPolygon) {
            if (mapPolygon.dataItem.dataContext &&
                mapPolygon.dataItem.dataContext["region"] == region) {
                mapPolygon.isActive = false;
                mapPolygon.setState("nullified");
            }
        });
    }
}
let geoGroup = chart.createChild(am4core.Container);
geoGroup.isMeasured = false;
geoGroup.layout = "vertical";
geoGroup.x = am4core.percent(2);
geoGroup.y = am4core.percent(12);
let regionNA = geoGroup.createChild(am4core.TextLink);
regionNA.margin(10, 10, 10, 10);
regionNA.text = "North America: On";
regionNA.events.on("hit", function () {
    toggleNA = !toggleNA;
    regionNA.text = "North America: ";
    if (toggleNA)
        regionNA.text += "On";
    else
        regionNA.text += "Off";
    toggleRegion(toggleNA, "North America");
});
let regionSA = geoGroup.createChild(am4core.TextLink);
regionSA.margin(10, 10, 10, 10);
regionSA.text = "South America: On";
regionSA.events.on("hit", function () {
    toggleSA = !toggleSA;
    regionSA.text = "South America: ";
    if (toggleSA)
        regionSA.text += "On";
    else
        regionSA.text += "Off";
    toggleRegion(toggleSA, "South America");
});
let regionCA = geoGroup.createChild(am4core.TextLink);
regionCA.margin(10, 10, 10, 10);
regionCA.text = "Central America & The Caribbean: Off";
regionCA.events.on("hit", function () {
    toggleCA = !toggleCA;
    regionCA.text = "Central America & The Caribbean: ";
    if (toggleCA)
        regionCA.text += "On";
    else
        regionCA.text += "Off";
    toggleRegion(toggleCA, "Central America & The Caribbean");
});
let regionEU = geoGroup.createChild(am4core.TextLink);
regionEU.margin(10, 10, 10, 10);
regionEU.text = "Europe: On";
regionEU.events.on("hit", function () {
    toggleEU = !toggleEU;
    regionEU.text = "Europe: ";
    if (toggleEU)
        regionEU.text += "On";
    else
        regionEU.text += "Off";
    toggleRegion(toggleEU, "Europe");
});
let regionAS = geoGroup.createChild(am4core.TextLink);
regionAS.margin(10, 10, 10, 10);
regionAS.text = "Asia: On";
regionAS.events.on("hit", function () {
    toggleAS = !toggleAS;
    regionAS.text = "Asia: ";
    if (toggleAS)
        regionAS.text += "On";
    else
        regionAS.text += "Off";
    toggleRegion(toggleAS, "Asia");
});
let regionAF = geoGroup.createChild(am4core.TextLink);
regionAF.margin(10, 10, 10, 10);
regionAF.text = "Africa: On";
regionAF.events.on("hit", function () {
    toggleAF = !toggleAF;
    regionAF.text = "Africa: ";
    if (toggleAF)
        regionAF.text += "On";
    else
        regionAF.text += "Off";
    toggleRegion(toggleAF, "Africa");
});
let regionME = geoGroup.createChild(am4core.TextLink);
regionME.margin(10, 10, 10, 10);
regionME.text = "Middle East: On";
regionME.events.on("hit", function () {
    toggleME = !toggleME;
    regionME.text = "Middle East: ";
    if (toggleME)
        regionME.text += "On";
    else
        regionME.text += "Off";
    toggleRegion(toggleME, "Middle East");
});
let regionOC = geoGroup.createChild(am4core.TextLink);
regionOC.margin(10, 10, 10, 10);
regionOC.text = "Oceania: Off";
regionOC.events.on("hit", function () {
    toggleOC = !toggleOC;
    regionOC.text = "Oceania: ";
    if (toggleOC)
        regionOC.text += "On";
    else
        regionOC.text += "Off";
    toggleRegion(toggleOC, "Oceania");
});
var tries = 3;
function enabledRegions() {
    let i = 0;
    let enabled = [];
    polygonSeries.mapPolygons.each(function (mapPolygon) {
        if (mapPolygon.isActive)
            enabled.push(i);
        i += 1;
    });
    return enabled;
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
var geoCountries = [];
var geoIterations = 0;
var gqOn = false;
var gqScore = 0;
var gqQuestions = 0;
let geoStart = geoGroup.createChild(am4core.TextLink);
geoStart.text = "Start";
geoStart.margin(10, 10, 10, 10);
geoStart.events.on("hit", function () {
    gqOn = true;
    gqScore = 0;
    geoIterations = 0;
    tries = 3;
    title.text = "Tries: " + tries;
    geoGroup.disabled = true;
    tipMode = 5;
    heatLegend.disabled = true;
    qDisplay.disabled = false;
    scoreDisplay.disabled = false;
    menuGroup.disabled = true;
    exitQuiz.disabled = false;
    geoCountries = shuffle(enabledRegions());
    gqQuestions = geoCountries.length;
    qDisplay.text = "Select: " + worldData[geoCountries[geoIterations]].name;
    scoreDisplay.text =
        gqScore +
            "/" +
            gqQuestions +
            "\n" +
            Math.floor((gqScore / gqQuestions) * 100) +
            "%";
});
geoGroup.disabled = true;
var totalScore = 0;
// let statSelect = menuGroup.createChild(am4core.TextLink);
// statSelect.margin(10, 10, 10, 10);
// statSelect.text = "Quiz Statistics";
// statSelect.events.on("hit", function () {
//     totalScore = 0;
//     menuSelections(5);
//     title.text = "Statistics";
//     polygonSeries.heatRules.push({
//         property: "fill",
//         target: polygonSeries.mapPolygons.template,
//         min: am4core.color("#e01616"),
//         max: am4core.color("#60e645")
//     });
//     polygonSeries.dataFields.value = "score";
//     tipMode = 1;
//     polygonSeries.invalidateData();
//     polygonSeries.dataItems.each(function (dataItem) {
//         if (dataItem.dataContext &&
//             dataItem.dataContext["score"] != undefined)
//             totalScore += dataItem.dataContext["score"];
//     });
//     totalScore = Math.floor(totalScore * 10) / 10;
//     scoreDisplay.disabled = false;
//     scoreDisplay.text = "Total Score: ";
//     if (totalScore > 0)
//         scoreDisplay.text += "+";
//     scoreDisplay.text += totalScore;
// });
let exitQuiz = chart.createChild(am4core.TextLink);
exitQuiz.isMeasured = false;
exitQuiz.layout = "vertical";
exitQuiz.x = am4core.percent(95);
exitQuiz.y = am4core.percent(65);
exitQuiz.horizontalCenter = "middle";
exitQuiz.margin(10, 10, 10, 10);
exitQuiz.text = "Exit Quiz";
exitQuiz.events.on("hit", function () {
    gqOn = false;
    flagImage.disabled = true;
    menuGroup.disabled = false;
    menuSelections(0);
    polygonSeries.heatRules.push({
        property: "fill",
        target: polygonSeries.mapPolygons.template,
        min: am4core.color("#43a11f"),
        max: am4core.color("#43a11f")
    });
    // title.text = "Interactive Map";
    tipMode = 3;
    polygonSeries.invalidateData();
    exitQuiz.disabled = true;
});
exitQuiz.disabled = true;
let triviaGroup = chart.createChild(am4core.Container);
triviaGroup.isMeasured = false;
triviaGroup.layout = "vertical";
triviaGroup.x = am4core.percent(2);
triviaGroup.y = am4core.percent(10);
var togglePopulation = true;
var toggleMedianAge = true;
var toggleGDP = true;
var toggleBirthRate = true;
var toggleDeathRate = true;
var togglePopulationGrowth = true;
var toggleLaborForce = true;
var toggleFlag = true;
var toggleCapital = true;
let tPopButton = triviaGroup.createChild(am4core.TextLink);
tPopButton.margin(10, 10, 10, 10);
tPopButton.text = "Population: On";
tPopButton.events.on("hit", function () {
    togglePopulation = !togglePopulation;
    tPopButton.text = "Population: ";
    if (togglePopulation)
        tPopButton.text += "On";
    else
        tPopButton.text += "Off";
});
let tMAButton = triviaGroup.createChild(am4core.TextLink);
tMAButton.margin(10, 10, 10, 10);
tMAButton.text = "Median Age: On";
tMAButton.events.on("hit", function () {
    toggleMedianAge = !toggleMedianAge;
    tMAButton.text = "Median Age: ";
    if (toggleMedianAge)
        tMAButton.text += "On";
    else
        tMAButton.text += "Off";
});
// let tGDPButton = triviaGroup.createChild(am4core.TextLink);
// tGDPButton.margin(10, 10, 10, 10);
// tGDPButton.text = "GDP(PPP): On";
// tGDPButton.events.on("hit", function () {
//     toggleGDP = !toggleGDP;
//     tGDPButton.text = "GDP(PPP): ";
//     if (toggleGDP)
//         tGDPButton.text += "On";
//     else
//         tGDPButton.text += "Off";
// });
let tBRButton = triviaGroup.createChild(am4core.TextLink);
tBRButton.margin(10, 10, 10, 10);
tBRButton.text = "Birth Rate: On";
tBRButton.events.on("hit", function () {
    toggleBirthRate = !toggleBirthRate;
    tBRButton.text = "Birth Rate: ";
    if (toggleBirthRate)
        tBRButton.text += "On";
    else
        tBRButton.text += "Off";
});
// let tDRButton = triviaGroup.createChild(am4core.TextLink);
// tDRButton.margin(10, 10, 10, 10);
// tDRButton.text = "Death Rate: On";
// tDRButton.events.on("hit", function () {
//     toggleDeathRate = !toggleDeathRate;
//     tDRButton.text = "Death Rate: ";
//     if (toggleDeathRate)
//         tDRButton.text += "On";
//     else
//         tDRButton.text += "Off";
// });
let tPGRButton = triviaGroup.createChild(am4core.TextLink);
tPGRButton.margin(10, 10, 10, 10);
tPGRButton.text = "Population Growth Rate On";
tPGRButton.events.on("hit", function () {
    togglePopulationGrowth = !togglePopulationGrowth;
    tPGRButton.text = "Population Growth Rate ";
    if (togglePopulationGrowth)
        tPGRButton.text += "On";
    else
        tPGRButton.text += "Off";
});
let tLFButton = triviaGroup.createChild(am4core.TextLink);
tLFButton.margin(10, 10, 10, 10);
tLFButton.text = "Labor Force: On";
tLFButton.events.on("hit", function () {
    toggleLaborForce = !toggleLaborForce;
    tLFButton.text = "Labor Force: ";
    if (toggleLaborForce)
        tLFButton.text += "On";
    else
        tLFButton.text += "Off";
});
let tFlagButton = triviaGroup.createChild(am4core.TextLink);
tFlagButton.margin(10, 10, 10, 10);
tFlagButton.text = "Flag: On";
tFlagButton.events.on("hit", function () {
    toggleFlag = !toggleFlag;
    tFlagButton.text = "Flag: ";
    if (toggleFlag)
        tFlagButton.text += "On";
    else
        tFlagButton.text += "Off";
});
let tCapitalButton = triviaGroup.createChild(am4core.TextLink);
tCapitalButton.margin(10, 10, 10, 10);
tCapitalButton.text = "Capital: On";
tCapitalButton.events.on("hit", function () {
    toggleCapital = !toggleCapital;
    tCapitalButton.text = "Capital: ";
    if (toggleCapital)
        tCapitalButton.text += "On";
    else
        tCapitalButton.text += "Off";
});
triviaGroup.disabled = true;
let testChoices = chart.createChild(am4core.Container);
testChoices.isMeasured = false;
testChoices.layout = "vertical";
testChoices.x = am4core.percent(3);
testChoices.y = am4core.percent(20);
//testChoices.horizontalCenter = "middle";
let choice1 = testChoices.createChild(am4core.TextLink);
choice1.margin(10, 10, 10, 10);
let choice2 = testChoices.createChild(am4core.TextLink);
choice2.margin(10, 10, 10, 10);
let choice3 = testChoices.createChild(am4core.TextLink);
choice3.margin(10, 10, 10, 10);
let choice4 = testChoices.createChild(am4core.TextLink);
choice4.margin(10, 10, 10, 10);
testChoices.disabled = true;
choice1.events.on("hit", function () {
    choiceSelection(rc1, crc);
});
choice2.events.on("hit", function () {
    choiceSelection(rc2, crc);
});
choice3.events.on("hit", function () {
    choiceSelection(rc3, crc);
});
choice4.events.on("hit", function () {
    choiceSelection(rc4, crc);
});
let settings = chart.createChild(am4core.Container);
settings.isMeasured = false;
settings.layout = "vertical";
settings.x = am4core.percent(5);
settings.y = am4core.percent(20);
settings.horizontalCenter = "middle";
var detailMode = 0;
let detailSetting = settings.createChild(am4core.TextLink);
detailSetting.margin(10, 10, 10, 10);
detailSetting.text = "Detail: Low";
detailSetting.events.on("hit", function () {
    detailMode += 1;
    if (detailMode >= 3)
        detailMode = 0;
    switch (detailMode) {
        case 0:
            chart.geodata = am4geodata_worldLow;
            detailSetting.text = "Detail: Low";
            break;
        case 1:
            chart.geodata = am4geodata_worldHigh;
            detailSetting.text = "Detail: High";
            break;
        case 2:
            chart.geodata = am4geodata_worldUltra;
            detailSetting.text = "Detail: Ultra";
            break;
    }
});
var flagMode = false;
let flagsToggle = settings.createChild(am4core.TextLink);
flagsToggle.margin(10, 10, 10, 10);
flagsToggle.text = "Flags: Off";
flagsToggle.events.on("hit", function () {
    flagMode = !flagMode;
    if (flagMode) {
        imageSeries.hidden = false;
        imageSeries.data = flagData;
        flagsToggle.text = "Flags: On";
    }
    else {
        imageSeries.hidden = true;
        imageSeries.data = null;
        flagsToggle.text = "Flags: Off";
    }
});
let selectColor = settings.createChild(am4core.TextLink);
selectColor.margin(10, 10, 10, 10);
let placeHolder = settings.createChild(am4core.TextLink);
placeHolder.margin(10, 10, 10, 10);
settings.disabled = true;
var onWD = true;
function clearChoices() {
    testChoices.disabled = true;
    /*if(!onWD) {
      polygonSeries.data = worldData;
      onWD = true;
    }*/
}
let activeState = polygonTemplate.states.create("active");
activeState.properties.fill = am4core.color("#3633d6");
activeState.properties.hoverable = true;
activeState.properties.clickable = true;
let hactiveState = polygonTemplate.states.create("hoverActive");
hactiveState.properties.fill = am4core.color("#02006e");
function choiceSelection(ind, cind) {
    //console.log(ind)
    //console.log(worldData[ind].id)
    if (ind == cind) {
        polygonSeries.getPolygonById(worldData[ind].id).defaultState.properties.fill = am4core.color("#60e645");
        polygonSeries.getPolygonById(worldData[ind].id).defaultState.properties.clickable = false;
        polygonSeries.getPolygonById(worldData[ind].id).isActive = false;
        polygonSeries.getPolygonById(worldData[ind].id).setState("correct");
        testButton.disabled = true;
        nextQuestion.disabled = false;
        if (!qWrong) {
            qCorrect += 1;
        }
        scoreDisplay.text =
            qCorrect +
                "/" +
                qAsked +
                "\n" +
                Math.floor((qCorrect / qAsked) * 100) +
                "%";
        if (!qWrong) {
            title.text = "Correct!";
            if (qdata == "flag" || qdata == "capital")
                polygonSeries.data[cind]["score"] += 2;
            else
                polygonSeries.data[cind]["score"] += 1;
        }
        else {
            title.text = "Correct";
            if (qdata == "flag" || qdata == "capital")
                polygonSeries.data[cind]["score"] -= 0.7;
            else
                polygonSeries.data[cind]["score"] -= 0.4;
        }
        if (qdata == "flag") {
        }
        else if (qdata == "capital") {
            choice1.text += ": " + worldData[rc1][qdata];
            choice2.text += ": " + worldData[rc2][qdata];
            choice3.text += ": " + worldData[rc3][qdata];
            choice4.text += ": " + worldData[rc4][qdata];
        }
        else {
            choice1.text +=
                ": " +
                    String(worldData[rc1][qdata]).replace(/(.)(?=(\d{3})+$)/g, "$1,");
            choice2.text +=
                ": " +
                    String(worldData[rc2][qdata]).replace(/(.)(?=(\d{3})+$)/g, "$1,");
            choice3.text +=
                ": " +
                    String(worldData[rc3][qdata]).replace(/(.)(?=(\d{3})+$)/g, "$1,");
            choice4.text +=
                ": " +
                    String(worldData[rc4][qdata]).replace(/(.)(?=(\d{3})+$)/g, "$1,");
        }
        choice1.clickable = false;
        choice2.clickable = false;
        choice3.clickable = false;
        choice4.clickable = false;
        /*if(qdata == "median age")
          tipMode = 1;
        else if(qdata == "birth rate" || qdata == "death rate") {
          tipMode = 4;
        }
        else if(qdata == "population growth")
          tipMode = 2
        else
          tipMode = 0;*/
    }
    else {
        title.text = "Wrong";
        qWrong = true;
        if (qdata == "flag" || qdata == "capital") {
            polygonSeries.data[ind]["score"] -= 0.4;
        }
        else {
            polygonSeries.data[ind]["score"] -= 0.5;
        }
        polygonSeries.getPolygonById(worldData[ind].id).defaultState.properties.fill = am4core.color("#e01616");
        polygonSeries.getPolygonById(worldData[ind].id).defaultState.properties.clickable = false;
        polygonSeries.getPolygonById(worldData[ind].id).isActive = false;
        polygonSeries.getPolygonById(worldData[ind].id).setState("wrong");
        //polygonSeries.data[ind].fill = am4core.color("#e01616");
        //polygonSeries.invalidateData();
    }
}
var flagImage = chart.createChild(am4core.Image);
flagImage.x = am4core.percent(50);
flagImage.y = am4core.percent(12);
flagImage.width = 120;
flagImage.height = 80;
flagImage.disabled = true;
function correctChoice(highest) {
    let cIndex = rc1;
    if (qdata == "flag") {
        cIndex = Math.floor(Math.random() * 4);
        if (cIndex == 0)
            cIndex = rc1;
        else if (cIndex == 1)
            cIndex = rc2;
        else if (cIndex == 2)
            cIndex = rc3;
        else if (cIndex == 3)
            cIndex = rc4;
        qTitle = "Which country does this flag belong to?";
        flagImage.href = worldData[cIndex]["flag"];
        flagImage.disabled = false;
        return cIndex;
    }
    else if (qdata == "capital") {
        cIndex = Math.floor(Math.random() * 4);
        if (cIndex == 0)
            cIndex = rc1;
        else if (cIndex == 1)
            cIndex = rc2;
        else if (cIndex == 2)
            cIndex = rc3;
        else if (cIndex == 3)
            cIndex = rc4;
        qTitle = "Which country's capital is " + worldData[cIndex]["capital"] + "?";
        return cIndex;
    }
    if (highest) {
        if (polygonSeries.data[cIndex][qdata] < polygonSeries.data[rc2][qdata]) {
            cIndex = rc2;
        }
        if (polygonSeries.data[cIndex][qdata] < polygonSeries.data[rc3][qdata]) {
            cIndex = rc3;
        }
        if (polygonSeries.data[cIndex][qdata] < polygonSeries.data[rc4][qdata]) {
            cIndex = rc4;
        }
    }
    else {
        if (polygonSeries.data[cIndex][qdata] > polygonSeries.data[rc2][qdata]) {
            cIndex = rc2;
        }
        if (polygonSeries.data[cIndex][qdata] > polygonSeries.data[rc3][qdata]) {
            cIndex = rc3;
        }
        if (polygonSeries.data[cIndex][qdata] > polygonSeries.data[rc4][qdata]) {
            cIndex = rc4;
        }
    }
    console.log("type: " +
        qdata +
        ", answer: " +
        worldData[cIndex].name +
        ": " +
        worldData[cIndex][qdata]);
    return cIndex;
}
let outlineC = chart.createChild(am4core.Container);
outlineC.isMeasured = false;
outlineC.layout = "vertical";
outlineC.x = am4core.percent(5);
outlineC.y = am4core.percent(70);
outlineC.horizontalCenter = "middle";
// var outT = false;
// let outlineButton = outlineC.createChild(am4core.TextLink);
// outlineButton.margin(10, 10, 10, 10);
// outlineButton.text = "Outline toggle";
// outlineButton.events.on("out", function () {
//     outT = !outT;
//     if (outT) {
//         polygonTemplate.defaultState.properties.stroke = am4core.color("#000000");
//         polygonTemplate.stroke = am4core.color("#000000");
//     }
//     else {
//         polygonTemplate.defaultState.properties.stroke = am4core.color("#ffffff");
//         polygonTemplate.stroke = am4core.color("#ffffff");
//     }
//     polygonSeries.mapPolygons.each(function (mapPolygon) {
//         if (outT) {
//             mapPolygon.stroke = am4core.color("#000000");
//         }
//         else {
//             mapPolygon.stroke = am4core.color("#ffffff");
//         }
//     });
//     //polygonSeries.invalidateData();
// });
let dataGroups = chart.createChild(am4core.Container);
dataGroups.isMeasured = false;
dataGroups.layout = "vertical";
dataGroups.x = am4core.percent(5);
dataGroups.y = am4core.percent(20);
dataGroups.horizontalCenter = "middle";
dataGroups.disabled = true;
// let popButton = dataGroups.createChild(am4core.TextLink);
// popButton.margin(10, 10, 10, 10);
// popButton.text = "Population";
// popButton.events.on("hit", function () {
//     //chart.projection = new am4maps.projections.Projection();
//     //clearChoices();
//     // title.text = "Population";
//     tipMode = 0;
//     /*polygonSeries.heatRules.push({
//         property: "fill",
//         target: polygonSeries.mapPolygons.template,
//         min: am4core.color("#ffffff"),
//         max: am4core.color("#AAAA00")
//       });*/
//     polygonSeries.mapPolygons.each(function (mapPolygon) {
//         if (mapPolygon.dataItem.dataContext) {
//             mapPolygon.dataItem.setValue("value", mapPolygon.dataItem.dataContext.population);
//             mapPolygon.defaultState.properties.fill = undefined;
//         }
//     });
//     //polygonSeries.dataFields.value = "population";
//     //polygonSeries.invalidateData();
// });
let maButton = dataGroups.createChild(am4core.TextLink);
maButton.text = "Median Age";
maButton.margin(10, 10, 10, 10);
maButton.events.on("hit", function () {
    //chart.projection = new am4maps.projections.maButton();
    //clearChoices();
    // title.text = "Median Age";
    //polygonTemplate.tooltipText = "{name}: {value.value.formatNumber('0.0')}";
    tipMode = 1;
    /*polygonSeries.heatRules.push({
        property: "fill",
        target: polygonSeries.mapPolygons.template,
        min: am4core.color("#ffffff"),
        max: am4core.color("#8573ff"),
      });*/
    polygonSeries.mapPolygons.each(function (mapPolygon) {
        if (mapPolygon.dataItem.dataContext) {
            mapPolygon.dataItem.setValue("value", mapPolygon.dataItem.dataContext["median age"]); // = (mapPolygon.dataItem.dataContext as any).median age;
            mapPolygon.defaultState.properties.fill = undefined;
        }
    });
    // polygonSeries.dataFields.value = "median age";
    //polygonSeries.invalidateData();
});
// let gdpButton = dataGroups.createChild(am4core.TextLink);
// gdpButton.text = "GDP (PPP)";
// gdpButton.margin(10, 10, 10, 10);
// gdpButton.events.on("hit", function () {
//     //chart.projection = new am4maps.projections.gdpButton();
//     //clearChoices();
//     // title.text = "GDP (PPP)";
//     tipMode = 0;
//     /*polygonSeries.heatRules.push({
//         property: "fill",
//         target: polygonSeries.mapPolygons.template,
//         min: am4core.color("#ffffff"),
//         max: am4core.color("#60e645")
//       });*/
//     polygonSeries.mapPolygons.each(function (mapPolygon) {
//         if (mapPolygon.dataItem.dataContext) {
//             mapPolygon.dataItem.setValue("value", mapPolygon.dataItem.dataContext["GDP(PPP)"]);
//             mapPolygon.defaultState.properties.fill = undefined;
//         }
//     });
//     // polygonSeries.dataFields.value = "GDP(PPP)";
//     //polygonSeries.invalidateData();
// });
let birthRateButton = dataGroups.createChild(am4core.TextLink);
birthRateButton.text = "Birth Rate";
birthRateButton.margin(10, 10, 10, 10);
birthRateButton.events.on("hit", function () {
    //clearChoices();
    // title.text = "Birth Rate";
    tipMode = 4;
    polygonSeries.mapPolygons.each(function (mapPolygon) {
        if (mapPolygon.dataItem.dataContext) {
            mapPolygon.dataItem.setValue("value", mapPolygon.dataItem.dataContext["birth rate"]);
            mapPolygon.defaultState.properties.fill = undefined;
        }
    });
    // polygonSeries.dataFields.value = "birth rate";
});
// let deathRateButton = dataGroups.createChild(am4core.TextLink);
// deathRateButton.text = "Death Rate";
// deathRateButton.margin(10, 10, 10, 10);
// deathRateButton.events.on("hit", function () {
//     //clearChoices();
//     // title.text = "Death Rate";
//     tipMode = 4;
//     polygonSeries.mapPolygons.each(function (mapPolygon) {
//         if (mapPolygon.dataItem.dataContext) {
//             mapPolygon.dataItem.setValue("value", mapPolygon.dataItem.dataContext["death rate"]);
//             mapPolygon.defaultState.properties.fill = undefined;
//         }
//     });
//     // polygonSeries.dataFields.value = "death rate";
// });
let popGrowthButton = dataGroups.createChild(am4core.TextLink);
popGrowthButton.text = "Population Growth";
popGrowthButton.margin(10, 10, 10, 10);
popGrowthButton.events.on("hit", function () {
    //clearChoices();
    // title.text = "Population Growth";
    tipMode = 2;
    polygonSeries.mapPolygons.each(function (mapPolygon) {
        if (mapPolygon.dataItem.dataContext) {
            mapPolygon.dataItem.setValue("value", mapPolygon.dataItem.dataContext["population growth"]);
            mapPolygon.defaultState.properties.fill = undefined;
        }
    });
    // polygonSeries.dataFields.value = "population growth";
});
let laborForceButton = dataGroups.createChild(am4core.TextLink);
laborForceButton.text = "Labor Force";
laborForceButton.margin(10, 10, 10, 10);
laborForceButton.events.on("hit", function () {
    //clearChoices();
    // title.text = "Labor Force";
    tipMode = 0;
    polygonSeries.mapPolygons.each(function (mapPolygon) {
        if (mapPolygon.dataItem.dataContext) {
            mapPolygon.dataItem.setValue("value", mapPolygon.dataItem.dataContext["labor force"]);
            mapPolygon.defaultState.properties.fill = undefined;
        }
    });
    // polygonSeries.dataFields.value = "labor force";
});
let colorGroup = chart.createChild(am4core.Container);
colorGroup.isMeasured = false;
colorGroup.layout = "vertical";
colorGroup.x = am4core.percent(95);
colorGroup.y = am4core.percent(20);
colorGroup.horizontalCenter = "middle";
colorGroup.disabled = true;
// let redHeatButton = colorGroup.createChild(am4core.TextLink);
// redHeatButton.text = "Red";
// redHeatButton.margin(10, 10, 10, 10);
// redHeatButton.events.on("hit", function () {
//     polygonSeries.heatRules.push({
//         property: "fill",
//         target: polygonSeries.mapPolygons.template,
//         min: am4core.color("#ffffff"),
//         max: am4core.color("#e84646")
//     });
//     polygonSeries.invalidateData();
// });
// let blueHeatButton = colorGroup.createChild(am4core.TextLink);
// blueHeatButton.text = "Blue";
// blueHeatButton.margin(10, 10, 10, 10);
// blueHeatButton.events.on("hit", function () {
//     polygonSeries.heatRules.push({
//         property: "fill",
//         target: polygonSeries.mapPolygons.template,
//         min: am4core.color("#ffffff"),
//         max: am4core.color("#3e4af7")
//     });
//     polygonSeries.invalidateData();
// });
// let yellowHeatButton = colorGroup.createChild(am4core.TextLink);
// yellowHeatButton.text = "Yellow";
// yellowHeatButton.margin(10, 10, 10, 10);
// yellowHeatButton.events.on("hit", function () {
//     polygonSeries.heatRules.push({
//         property: "fill",
//         target: polygonSeries.mapPolygons.template,
//         min: am4core.color("#ffffff"),
//         max: am4core.color("#AAAA00")
//     });
//     polygonSeries.invalidateData();
// });
// let greenHeatButton = colorGroup.createChild(am4core.TextLink);
// greenHeatButton.text = "Green";
// greenHeatButton.margin(10, 10, 10, 10);
// greenHeatButton.events.on("hit", function () {
//     polygonSeries.heatRules.push({
//         property: "fill",
//         target: polygonSeries.mapPolygons.template,
//         min: am4core.color("#ffffff"),
//         max: am4core.color("#5ee026")
//     });
//     polygonSeries.invalidateData();
// });
var qDisplay = chart.createChild(am4core.Label);
qDisplay.text = "";
qDisplay.fontsize = 5;
qDisplay.align = "center";
qDisplay.isMeasured = false;
qDisplay.x = am4core.percent(2);
qDisplay.y = am4core.percent(15);
qDisplay.disabled = true;
var scoreDisplay = chart.createChild(am4core.Label);
scoreDisplay.text = "";
scoreDisplay.fontsize = 5;
scoreDisplay.align = "center";
scoreDisplay.isMeasured = false;
scoreDisplay.x = am4core.percent(85);
scoreDisplay.y = am4core.percent(15);
scoreDisplay.disabled = true;
var tHex = "#3633d6";
var rc1 = 0;
var rc2 = 0;
var rc3 = 0;
var rc4 = 0;
var crc = 0;
var qdata = null;
var qType = null;
var qhilo = null;
var highest = null;
let clist = [-1, -1];
var qAsked = 0;
var qCorrect = 0;
var qWrong = false;
var qTitle = "";
polygonTemplate.events.on("hit", function (ev) {
    if (testChoices.disabled == false) {
        if (ev.target.dataItem.dataContext &&
            ev.target.dataItem.dataContext.id == worldData[crc].id)
            choiceSelection(crc, crc);
        else {
            title.text = "Wrong";
            if (qdata == "flag" || qdata == "capital") {
                ev.target.dataItem.dataContext["score"] -= 0.4;
            }
            else {
                ev.target.dataItem.dataContext["score"] -= 0.5;
            }
            qWrong = true;
            ev.target.defaultState.properties.fill = am4core.color("#e01616");
            ev.target.defaultState.properties.clickable = false;
            ev.target.isActive = false;
            ev.target.setState("wrong");
        }
    }
    else if (gqOn) {
        if (ev.target.dataItem.dataContext &&
            ev.target.dataItem.dataContext.id ==
                worldData[geoCountries[geoIterations]].id) {
            if (tries == 3) {
                ev.target.defaultState.properties.fill = am4core.color("#60e645");
                gqScore += 1;
                scoreDisplay.text =
                    gqScore +
                        "/" +
                        gqQuestions +
                        "\n" +
                        Math.floor((gqScore / gqQuestions) * 100) +
                        "%";
                ev.target.dataItem.dataContext["score"] += 1.5;
            }
            else if (tries == 2) {
                ev.target.defaultState.properties.fill = am4core.color("#d6d324");
                ev.target.dataItem.dataContext["score"] -= 0.1;
            }
            else if (tries == 1) {
                ev.target.defaultState.properties.fill = am4core.color("#e38629");
                ev.target.dataItem.dataContext["score"] -= 0.45;
            }
            ev.target.defaultState.properties.clickable = false;
            ev.target.isActive = false;
            if (geoCountries.length - 1 != geoIterations) {
                geoIterations += 1;
                tries = 3;
                title.text = "Tries: " + tries;
                qDisplay.text =
                    "Select: " + worldData[geoCountries[geoIterations]].name;
            }
            else {
                qDisplay.text = "Finished!";
                title.text = "";
            }
        }
        else {
            if (tries == 1) {
                ev.target.dataItem.dataContext["score"] -= 0.35;
                polygonSeries.getPolygonById(worldData[geoCountries[geoIterations]].id).dataItem.dataContext["score"] -= 2.1;
                polygonSeries.getPolygonById(worldData[geoCountries[geoIterations]].id).defaultState.properties.fill = am4core.color("#e01616");
                polygonSeries.getPolygonById(worldData[geoCountries[geoIterations]].id).defaultState.properties.clickable = false;
                polygonSeries.getPolygonById(worldData[geoCountries[geoIterations]].id).isActive = false;
                polygonSeries
                    .getPolygonById(worldData[geoCountries[geoIterations]].id)
                    .setState("wrong");
                if (geoCountries.length - 1 != geoIterations) {
                    geoIterations += 1;
                    tries = 3;
                    title.text = "Tries: " + tries;
                    qDisplay.text =
                        "Select: " + worldData[geoCountries[geoIterations]].name;
                }
                else {
                    qDisplay.text = "Finished!";
                    title.text = "";
                }
            }
            else {
                ev.target.dataItem.dataContext["score"] -= 0.35;
                tries -= 1;
                title.text = "Tries: " + tries;
            }
        }
    }
});
let nextQuestion = testChoices.createChild(am4core.TextLink);
nextQuestion.text = "Next";
nextQuestion.margin(10, 10, 10, 10);
nextQuestion.events.on("hit", function () {
    title.text = "";
    qWrong = false;
    tipMode = 3;
    heatLegend.disabled = true;
    nextQuestion.disabled = true;
    flagImage.disabled = true;
    displayQuestion();
});
nextQuestion.disabled = true;
var qTypes = [];
function displayQuestion() {
    choice1.clickable = true;
    choice2.clickable = true;
    choice3.clickable = true;
    choice4.clickable = true;
    qAsked += 1;
    rc1 = Math.floor(Math.random() * Object.keys(worldData).length);
    do {
        rc2 = Math.floor(Math.random() * Object.keys(worldData).length);
    } while (rc2 == rc1);
    do {
        rc3 = Math.floor(Math.random() * Object.keys(worldData).length);
    } while (rc3 == rc1 || rc3 == rc2);
    do {
        rc4 = Math.floor(Math.random() * Object.keys(worldData).length);
    } while (rc4 == rc1 || rc4 == rc2 || rc4 == rc3);
    qTitle = "Select the highlighted country with the ";
    qhilo = Math.floor(Math.random() * 2);
    qType = Math.floor(Math.random() * qTypes.length);
    if (qhilo == 1) {
        highest = true;
        qTitle += "highest ";
    }
    else {
        highest = false;
        qTitle += "lowest ";
    }
    /*if(qType == 0)
      qdata = "population";
    else if(qType == 1)
      qdata = "median age";
    else if(qType == 2)
      qdata = "GDP(PPP)";
    else if(qType == 3)
      qdata = "birth rate";
    else if(qType == 4)
      qdata = "death rate";
    else if(qType == 5)
      qdata = "population growth";
    else if(qType == 6)
      qdata = "labor force";*/
    qdata = qTypes[qType];
    qTitle += qdata;
    if (qAsked > 1)
        scoreDisplay.text =
            qCorrect +
                "/" +
                qAsked +
                "\n" +
                Math.floor((qCorrect / qAsked) * 100) +
                "%";
    onWD = false;
    polygonSeries.mapPolygons.each(function (mapPolygon) {
        if (mapPolygon.dataItem.dataContext &&
            mapPolygon.dataItem.dataContext.id != worldData[rc1].id &&
            mapPolygon.dataItem.dataContext &&
            mapPolygon.dataItem.dataContext.id != worldData[rc2].id &&
            mapPolygon.dataItem.dataContext &&
            mapPolygon.dataItem.dataContext.id != worldData[rc3].id &&
            mapPolygon.dataItem.dataContext &&
            mapPolygon.dataItem.dataContext.id != worldData[rc4].id)
            mapPolygon.setState("nullified");
        else
            mapPolygon.setState("active");
        mapPolygon.defaultState.properties.fill = undefined;
    });
    //polygonSeries.dataFields.value = qdata;
    crc = correctChoice(highest);
    qDisplay.text = qTitle;
    choice1.text = worldData[rc1].name;
    choice2.text = worldData[rc2].name;
    choice3.text = worldData[rc3].name;
    choice4.text = worldData[rc4].name;
}
let testButton = triviaGroup.createChild(am4core.TextLink);
title.text = "";
testButton.text = "Start";
testButton.margin(10, 10, 10, 10);
testButton.events.on("hit", function () {
    qCorrect = 0;
    qAsked = 0;
    scoreDisplay.text = "";
    testChoices.disabled = false;
    triviaGroup.disabled = true;
    tipMode = 3;
    heatLegend.disabled = true;
    qWrong = false;
    qDisplay.disabled = false;
    scoreDisplay.disabled = false;
    menuGroup.disabled = true;
    exitQuiz.disabled = false;
    qTypes = [];
    if (togglePopulation) {
        qTypes.push("population");
    }
    if (toggleMedianAge) {
        qTypes.push("median age");
    }
    if (toggleGDP) {
        qTypes.push("GDP(PPP)");
    }
    if (toggleBirthRate) {
        qTypes.push("birth rate");
    }
    if (toggleDeathRate) {
        qTypes.push("death rate");
    }
    if (togglePopulationGrowth) {
        qTypes.push("population growth");
    }
    if (toggleLaborForce) {
        qTypes.push("labor force");
    }
    if (toggleFlag) {
        qTypes.push("flag");
    }
    if (toggleCapital) {
        qTypes.push("capital");
    }
    displayQuestion();
});
let lc2 = chart.createChild(am4core.Container);
lc2.isMeasured = false;
lc2.layout = "horizontal";
lc2.x = am4core.percent(10);
lc2.y = am4core.percent(88);
lc2.horizontalCenter = "middle";
// let millerButton = lc2.createChild(am4core.TextLink);
// millerButton.margin(10, 10, 10, 10);
// millerButton.text = "Miller";
// millerButton.events.on("hit", function () {
//     chart.projection = millerProj;
//     chart.panBehavior = "move";
// });
// let orthoButton = lc2.createChild(am4core.TextLink);
// orthoButton.margin(10, 10, 10, 10);
// orthoButton.text = "Orthographic";
// orthoButton.events.on("hit", function () {
//     chart.projection = orthoProj;
//     chart.panBehavior = "rotateLongLat";
// });
