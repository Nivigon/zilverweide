# Dorendael: alle karakter-interacties per locatie

Overzicht voor herevaluatie van de teksten, in dezelfde opzet als
kraaienkwartier_interacties.md. Bron: de live renderfuncties in
zilverweide.html (renderDd2Nummer2, renderDd3Nummer10, renderDd4Herberg,
renderDd5Woud, renderDd6Molen, renderDd7Klokkenmaker, renderDd8Stiltevijver en
hun vervolg- en hulpfuncties). Alle spelerstekst staat hier zo letterlijk
mogelijk, inclusief regie-aanwijzingen tussen *( )*. Knoppen, code-invoer en
mechanieken staan als [Knop: ...], [UI: ...] en [Mechaniek: ...].

De vijf cruciale missie-sleutels van Dorendael zijn: sleutel woudpoort gemaakt,
meisje afgeleverd, muziekdoosje afgeleverd, Sybille-mythe gelezen en
herberg-scene voltooid. Zodra die vijf binnen zijn opent de heks-gok op het
podium (Dorpsplein); daarna volgt het woud-doolhof (DD5).

---

## DD2 - Nummer 2

Het verlaten huis. De hoofdlijn is Felix' keuze in de achterkamer (wachten of
de zak stelen). De andere rollen krijgen korte, verontrustende taferelen.

### Jan

> Het huis staat er verlaten bij, de deur op een kier. Jan duwt hem voorzichtig verder open.

- Jan: "Voetstappen. Vlakbij. Dit is niet het moment om betrapt te worden."
> Hij glipt net op tijd naar buiten. Vanuit de schaduw ziet hij een schimmig figuur het huis binnenlopen, brede schouders, zware tred. Jan maakt dat hij wegkomt.

Jan komt nooit binnen.

### Kelly

> Kelly klopt aan. Na een korte stilte gaat de deur op een kier. Iemand doet een stap terug, de deur blijft openstaan.

- [Knop: 🚪 Ga naar binnen] leidt naar de voorkamer (bij binnenkomst verschijnt Bart intens):
- De man: "Er is iets gaande bij de oude molen. Iets serieus donkers. Duister."
- Kelly: "En... hoe weet u dat dan?"
- De man: "Gaat je niets aan!"
> Hij pakt een lange draad en trekt hem strak tussen zijn handen. Dan, opeens, begint hij maniacaal te lachen.
- Kelly: *(ongemakkelijk)* "Ik... ik moet gaan."
> Kelly rent weg. Ze denkt nog: dat draad leek echt bekend. Of verbeeld ik me dat?

### Fenna-Viviènne

> Het huis oogt verlaten, maar binnen brandt licht. Fenna klopt aan en de deur valt open.

- [Knop: 🚪 Ga naar binnen] leidt naar de voorkamer:
> Binnen draait een man met brede schouders zich langzaam om. Hij kijkt Fenna intens aan, zonder een woord.
- Fenna-Viviènne: "Uhm... pardon ma-"
> Dit voelt niet goed. Fenna draait zich om en vlucht.

### Felix

**Eerste bezoek, buiten**
> Het huis staat er verlaten bij. De deur op een kier, geen licht, geen geluid.

- Felix: "Een open deur is een uitnodiging. Zeker voor een spion."
- [Knop: 🚪 Glip naar binnen]

**Voorkamer**
> Het huis is leeg en smerig. Vergeten meubels, stof, scheef hangende schilderijen.
> Op een kast staat een vreemde beer, bezet met dozijnen naalden, alsof iemand hem als speldenkussen heeft gebruikt.

- Felix: "Als spion weet je dat verlaten huizen nooit echt leeg zijn. Achter elke deur, in elke lade, geheimen. Je begint rond te neuzen."
- [Knop: 🕳️ Naar de achterkamer]

**Achterkamer (de keuze)**
> De achterkamer. Op een wankele tafel: een zware zak. Munten, je hoort het rinkelen door de stof. Niemand te zien. Niemand te horen.

- ⚠: "Denk goed na over wat je kiest."
- [Knop: Ik wacht wel even of er iemand komt]
- [Knop: Pak de zak en ga] (bloedrode stijl)

**Wachten**
[UI: wachtscherm "🏚️ Nummer 2", sub "Je wacht in de stilte van het verlaten huis", cursief "Felix wacht...", aftellende timer van 15 seconden. Achtergrondmuziek pauzeert, hartslag-loop speelt. Daarna verschijnt de bewoner. Markeert felix_dd2_gewacht en geeft 💰 Munten van de Bewoner.]

Als Lucinde:
- De Bewoner: "*Ach mevrouw... bent u de weg kwijt? Maakt u zich geen zorgen, zo'n vriendelijke dame zou nooit opzettelijk met mijn centen aan de haal gaan.*"
> Hij drukt je vriendelijk de zak in je handen en wuift je weg.
- De Bewoner: "*Maar blijf na donker bij de molen vandaan, mevrouw. Er zit iets. Een beest, zeggen sommigen. Een zwerver, zeggen anderen. En mijn buurvrouw fluistert dat het helemaal geen mens is. Ik weet het niet. Niemand weet het. Alleen dat je er 's nachts beter niet gaat kijken.*"
- [Knop: ← Terug naar Dorendael]

Als De Vos (elke andere vermomming):
> De voetstappen komen dichterbij. De Vos haalt diep adem, recht zijn rug, en stapt naar voren, voor de bewoner hem kan aanspreken.
- De Vos: "*Goedenavond. Ik kom namens de heer *(mompelt iets onverstaanbaars)*. U had nog huur openstaan.*"
> Zonder op een antwoord te wachten draait hij zich om, pakt de zak op, en is weg voor de bewoner een woord kan uitbrengen. Spionnentactiek.
- [Knop: ← Terug naar Dorendael]

**De zak stelen**
[Effect: markeert felix_dd2_gestolen, geeft 💰 Munten van de Bewoner EN 🌑 De Schaduw (start de schaduwvloek-onboarding: zwart intro plus uitleg-popup), daarna terug naar Dorendael. Geen aparte scene-tekst.]

**Al gekozen (na wachten of stelen)**
> Het huis staat er stil bij, de deur op een kier.

- Verteller: "Hier ben je al geweest. Niets meer te halen."

### Overige rollen (alleen sfeer)

> Het huis is leeg en smerig. Vergeten meubels, stof, scheef hangende schilderijen.
> Op een kast staat een vreemde beer, bezet met dozijnen naalden, alsof iemand hem als speldenkussen heeft gebruikt.

### Na Heer Donatuslaan (alle rollen)

> Het huis staat er donker bij. In de deuropening staat Bart. Zijn mond is dichtgenaaid. Hij staart je aan met lege ogen.
> Hier valt niets meer te doen. Je loopt door.

---

## DD3 - Nummer 10

Het huis van Merel en haar moeder (Trijn). Fenna brengt Merel hier terug; de
andere rollen sprokkelen aanwijzingen bij de wijkwacht en de buurt.

### Fase: voor Merel terug is

**Kelly**
> Voor de deur van Nummer 10 staat Mevr. van Wallingen te smoezen met een wijkwachter.
> Ze ziet Kelly aankomen. Met een beladen toon en een dreigend opgetrokken wenkbrauw:
- Mevr. van Wallingen: "Wel, wel. Daar is ze dan."
> Kelly besluit dat ze hier niets te zoeken heeft en maakt rechtsomkeert.

**Jan**
> Voor de deur staat een wijkwacht met gekruiste armen.
- Wijkwacht: "Doorlopen! Hier valt niets te zien."
> Het raam staat op een kier. Van binnen komt frustratie, één stem, fel:
- Een stem binnen: "Sinds Strix erbij is zegt dat rotkind steeds minder! Kan mij wat schelen dat ze weg is!"

**Fenna-Viviènne**
> Fenna stapt op de wijkwacht af — ze zijn tenslotte op heksenjacht, en een wachter ziet veel.
- Fenna-Viviènne: "Zeg eens, is u hier in de straat soms iets vreemds opgevallen?"
- Wijkwacht: "Als u iets wilt zien — ga bij de vijver kijken. Daar verzamelt zich op dit moment een hoop bezorgd volk."

**Felix als Lucinde**
- Wijkwacht: "Bent u de oma? Kom gauw naar binnen!"
> Voor Lucinde kan protesteren wordt ze al naar binnen gewuifd.
- Wijkwacht: "Eh... mevrouw, uw moeder is er."
> Een gestreste vrouw kijkt verward op. Dit is duidelijk niet háár moeder.
- Lucinde: *(binnensmonds)* "Oh. Shit."
> Ze maakt rechtsomkeert en rent. Achter haar klinkt nog de stem van de moeder:
- De moeder: "Breng haar nú terug naar ons...!"

**Felix als Lola**
> Lola ziet de wijkwacht bij de deur staan en blijft op veilige afstand.
- Lola: *(mompelt)* "Ay, wijkwachters... daar meng ik me maar beter niet in. Niet met alles wat er nog op mijn naam staat, querido."
> Ze glipt de schaduw weer in, voor iemand haar gezicht goed kan bekijken.

**Felix zonder vermomming (oud-spion)**
> Als oud-spion kent Felix de taal van mannen die de overheid dienen. Hij slentert op de wachter af alsof hij hier hoort.
- Felix: "Zware avond, collega?"
- Wijkwacht: *(zucht)* "Een vermissing. Een meisje. En haar kikker, geloof het of niet."
- Felix: *(knikt wijs)* "Een kikker. Natuurlijk. Het is altijd de kikker."

**Overige rollen (fallback)**
> Voor de deur staat een wijkwacht. Van binnen komt rumoer.
- Wijkwacht: "Doorlopen! Hier valt niets te halen."

### Fase: Fenna levert Merel af (Fenna met het meisje in inventaris)

> De wijkwacht ziet Fenna aankomen met Merel aan haar hand en gebaart haar haastig naar binnen.

- Fenna-Viviènne: "Ze begon onderweg te praten. Maar Strix, haar kikker, is ergens onderweg verloren gegaan. Ze is er erg van slag van."
- De moeder: *(te snel, te scherp)* "Ze práát?"
> Een stilte van een tel. Dan verandert er iets in het gezicht van de moeder. De scherpte is weg, alsof er een gordijn dichtschuift.
- De moeder: *(opeens te ontspannen, met een half lachje)* "Och, en die kikker. Die komt vanzelf wel terug. Ze komen altijd terug."
> Ze grijpt Merel zachtjes maar strak bij de pols en trekt haar dichterbij.
- De moeder: *(te luid, recht tegen Merel)* "Hoezo kun je nu opeens wél praten? Waar heb je dat gehaald?"
> Merel kijkt naar de grond. De wijkwachter staart strak voor zich uit, alsof hij niets hoort.
- ⚠: "Er klopt iets niet. Maar je hebt geen reden om te blijven. Vertrek."
- [Knop: Vertrek] levert het meisje-item in, zet de vlag meisje_afgeleverd en keert terug naar Dorendael.

### Fase: Merel is terug (meisje_afgeleverd)

**Jan**
> De wijkwacht die hier post hield is verdwenen. Het is opvallend stil geworden rond Nummer 10.
> Voor het raam zit een meisje. Ze staart naar buiten, het gezicht volkomen uitdrukkingsloos.
- Jan: "Hé... gaat alles wel goed met je daarbinnen?"
> Geen reactie. Ze knippert niet eens.

**Fenna-Viviènne**
> Fenna stapt naar binnen. Aan de tafel staat de moeder over Merel gebogen, net iets te dichtbij, net iets te streng.
> Zodra ze Fenna ziet schiet ze overeind. In een tel is de harde blik weg, vervangen door een brede, poeslieve glimlach.
- De moeder: "O! Wat lief dat u nog even komt kijken. Alles is hier weer helemaal in orde, hoor."
> Fenna's blik dwaalt langs de kapstok. Een mannenjas, grijs van het stof. Eronder een paar laarzen waar in geen maanden iemand in heeft gestaan.
> De moeder volgt haar blik. Net iets te snel:
- De moeder: "Mijn man is op reis. Handel."
- Fenna-Viviènne: *(in gedachten)* "Op reis. En zijn jas hangt hier stof te vangen."
> Er hangt iets in de lucht dat niet klopt. Iets dat aan heksen doet denken.

**Felix als Lucinde**
> Op de hoek staan twee buurvrouwen zachtjes naar het huis te kijken. Zodra ze Lucinde zien, schuiven ze vanzelfsprekend een stukje op. Zij hoort erbij.
- Buurvrouw: "De vader, weet u nog? Ooit liep die hier gewoon rond. Groette iedereen, hielp de buurman met zijn dak. En op een dag, foetsie."
- Tweede buurvrouw: "En niemand die ernaar vraagt. Vindt u dat niet vreemd?"
- Lucinde: *(knikt bedachtzaam)* "Hoogst merkwaardig, dames. Hoogst merkwaardig."
- Lucinde: *(in gedachten)* "Een man die verdwijnt en een dorp dat niet vraagt. Dat onthoud ik."

**Felix (overige vermommingen, geen Lucinde)**
> Felix vangt flarden op en sluipt dichterbij, tot vlak onder het open raam.
> Binnen klinkt de stem van een vrouw, zacht maar gespannen:
- De moeder (binnen): "Sinds die kikker weg is, praat ze. Steeds meer. En jíj houdt je mond over wat je gezien hebt."
> Felix houdt zijn adem in. Tegen wie praat ze daar eigenlijk?

**Kelly**
> Voor de deur staat Mevr. van Wallingen na te kletsen met een wijkwachter. Ze ziet Kelly en laat haar stem zakken.
- Mevr. van Wallingen: "Weten jullie wel hoe dat meisje het daar bij Trijn heeft? Ik hoorde dat ze in een bezemkast moet slapen..."
> Ze laat de woorden hangen en kijkt Kelly veelbetekenend aan.

**Overige rollen (fallback)**
> De wijkwacht is verdwenen. Voor het raam zit een meisje roerloos naar buiten te staren.

### Na Heer Donatuslaan (alle rollen)

> De deur staat op een kier. In de deuropening staat Trijn. Haar mond is dichtgenaaid. Ze kijkt je aan zonder te bewegen.
> Je loopt door.

---

## DD4 - De Herberg

De grote Fenna-locatie: de zolder-scene met de heks (herberg_scene_voltooid).
De andere rollen worden de zolder op geroepen om Fenna bij te staan. Elke rol
begint buiten met [Knop: 🚪 Ga naar binnen].

### Buiten (alle rollen)

> De herberg. Door het raam zie je beweging, en je hoort stemmen.

### DEEL 1 - De gelagkamer voor de zolder-scene

**Jan**
> De herberg is donker en warm. Een paar gasten hangen gebogen over hun bier. Niemand kijkt op als Jan binnenkomt.
> In een hoek bij het haardvuur, Mevr. van Wallingen. Ze kijkt hem al aan voor hij háár ziet.
- Herbergier: *(zacht, alsof tegen zijn glas)* "Wat brengt jou hier, lange?"
- [Knop: 🍺 Drink iets aan de bar]:
  > Jan leunt tegen de bar. De herbergier schuift hem zwijgend een pul toe, ogen nog steeds neergeslagen.
  - Herbergier: "Drink. En praat niet te veel. Dat is hier gezonder."
  - [Knop: ← Terug]
- [Knop: 👁 Ga naar Mevr. van Wallingen]:
  > Ze gebaart naar de stoel tegenover haar. Op het tafelblad staat al een volle, dampende pul. Alsof ze hem verwachtte.
  - Jan: *(zonder te gaan zitten)* "U bent overal."
  - Mevr. van Wallingen: "Ben ik dat? Of zijn jullie overal?"
  > Ze tikt met een vinger op het tafelblad. Tik. Tik. Een ritme dat Jan ergens van kent, maar niet kan plaatsen.
  - Mevr. van Wallingen: "Ga eens zitten, lange jongen. Drink je bier."
  > Jan kijkt naar de pul. Het oppervlak rimpelt licht. Alsof er iets onder beweegt.
  - (als Jan de woudpoort al zag) Mevr. van Wallingen: "Jullie zijn een sleutel kwijt, hè? Voor een poort die je niet kent. Stom, hoor."
  - (als Jan de woudpoort al zag) Jan: *(in gedachten)* "Ik heb niemand over die woudpoort verteld."
  - (anders) Mevr. van Wallingen: "Lang zal je moeten reiken voor wat jullie zoeken. Maar niet alle deuren openen met sleutels."
  - Mevr. van Wallingen: *(glimlach)* "Loop maar door, lange jongen. Je dame boven heeft je straks nodig."
  - Jan: *(in gedachten)* "Ze weet dingen die ze niet kan weten."
  - [Knop: Loop door →]
- [Knop: Vertrek] (bloedrode stijl)

**Kelly**
> Kelly stapt de herberg in. Het ruikt naar bier, oud hout en iets zoetigs dat ze niet kan plaatsen. Eén man aan de bar lacht net iets te hard om niets.
- Herbergier: *(zijn ogen blijven een tel te lang op haar rusten)* "Een meisje alleen. Op zoek naar iemand?"
- Kelly: "Eh, nee, ik kijk alleen even rond."
- Herbergier: "Boven slaapt het beter. Mocht je daar interesse in hebben."
> Hij wijst niet naar de trap. Maar Kelly weet precies welke trap hij bedoelt.
- Kelly: *(in gedachten)* "Hij weet meer dan hij toont. Boven moet ik niet zijn."
- [Knop: ↑ Ga naar boven] (herbergier verspert de trap zolang Fenna de klok niet gestart heeft, zie "De trap geweigerd")
- [Knop: Vertrek nog niet] (bloedrode stijl)

**Fenna-Viviènne**
> Bij binnenkomst draaien een paar hoofden zich naar haar, een artieste in een herberg trekt aandacht.
> De herbergier neemt haar van top tot teen op. Zijn glimlach is meer kromming dan vreugde.
- Herbergier: "Mevrouw. Wat een eer. Iemand boven heeft net naar u gevraagd."
- Fenna-Viviènne: "Naar mij?"
- Herbergier: "Hij weet wie u bent. En u kent hem ook, geloof ik."
> Hij wijst niet. Maar zijn ogen flitsen heel kort naar de trap.
- Fenna-Viviènne: *(in gedachten)* "Hij speelt een spel. Maar ik voel wie hij bedoelt."
- [Knop: ↑ Ga naar boven] (start de zolder/briefje-flow)
- [Knop: Vertrek nog niet] (bloedrode stijl)

**Felix als Lucinde**
> Lucinde-Felix waggelt binnen. De herbergier kijkt op en ontspant zichtbaar, een oud vrouwtje is geen bedreiging.
- Herbergier: "Mevrouwtje. Komt u uit de regen?"
- Lucinde: "Och, lieverd, ik zoek mijn brillen. Heb ik die hier laten liggen?"
- Herbergier: "Brillen heb ik niet gezien, mevrouwtje. Maar gaat u toch even zitten. U lijkt vermoeid."
- Lucinde: *(luid en doof)* "WAT ZEGT U?"
- Herbergier: *(geduldig fluisterend)* "Gaat u maar zitten."
- Lucinde: *(in gedachten)* "Hij wil me hier houden. Verzin een excuus."
- Lucinde: "Ach, ik kom morgen wel terug. Moet nog naar de kruidenier."
> Ze waggelt naar buiten.

**Felix als Lola**
> Lola walst binnen alsof ze de herberg bezit. Mannen kijken op. De herbergier blijft zijn glas drogen, maar zijn ogen volgen.
- Lola: "Caballero! Een pul van uw beste!"
> De herbergier zet zwijgend een pul neer. Hij kijkt heel kort naar haar baard.
- Herbergier: "Beste? Hier is alles even sterk, mevrouwtje. Net als boven."
- Lola: "Boven?"
- Herbergier: "Boven is een kamertje. Daar wachten mensen. Soms op iemand. Soms op iemand anders. Het hangt ervan af."
> Lola lacht en gooit haar hoofd in haar nek.
- Lola: *(in gedachten)* "Hoe weet hij dat ik niet ben wie ik lijk? Hij speelt mee. Dat is erger dan doorzien worden."

**Felix zonder vermomming (de oud-spion)**
> Felix glipt binnen, ogen scannend zoals altijd, een gewoonte van vroeger. Hij telt: zes gasten, één herbergier, twee uitgangen.
> Aan een tafel in de hoek: een vrouw. Ze kijkt zijn kant op zonder echt naar hem te kijken.
- Felix: *(in gedachten)* "Die vrouw lijkt verdomd veel op Mevr. van Wallingen uit Kraaienkwartier. Of speelt mijn blik me parten?"
> Ze knikt hem toe. Heel licht. Heel kort. Alsof ze weet dat hij haar herkent. Felix wendt zijn blik af.
- Herbergier: "Reist u alleen?"
- Felix: *(vlot)* "Op zoek naar een drankje en een verhaal."
- Herbergier: "Verhalen genoeg hier. Maar de verteller is even bezet. Boven."
> Hij grijnst nu echt. Tanden te lang. Of Felix verbeeldt het zich.
- Felix: *(in gedachten)* "Vertrekken, voor hij meer zegt."

**Overige rollen (fallback)**
> De gele lampen werpen warme schaduwen op de muren. De herbergier veegt glazen af, te ijverig om niet verdacht te zijn.
- Herbergier: "Kijk gerust rond. Maar blijf niet te lang."

### De trap geweigerd (niet-Fenna, klok nog niet gestart)

> Je zet een voet op de onderste trede. Uit het niets staat de herbergier naast je, een halfdroog glas nog in zijn hand.
- Herbergier: "Boven is niets voor jou. Nog niet."
> Hij blijft staan tot je van de trap stapt. Dit was geen uitnodiging om het nog eens te proberen.
- [Knop: ← Terug de gelagkamer in]

### De zolder-scene

**Fenna leest het briefje (titel: Zolderkamer)**
> Een kleine kamer, dun licht door één raam. Op de tafel ligt een gevouwen briefje met je naam erop. Je pakt het op, breekt het zegel, en leest...

Briefje:
> Lieve Fenna, ik kon niet langer op je wachten, maar heb dit voor jou achtergelaten. Ik ben zelf ook op zoek naar die heks. Hoop dat dit allemaal op te lossen is. Liefs, Robbie

- [Knop: Maar plots...] start de taunt-arc.

**De heks, taunt-arc (overlay, circa 30 seconden, zonder sprekernaam)**
> Zo zoet... dat stemmetje van je
> Mijn kleine fruitbloempje... rijp om te plukken
> Zing nog maar, klein vogeltje. Zing zo hard je kan.
> Want straks naai ik dat liedje voorgoed achter je lippen.

Daarna (rood, rage), waarna de klok en de oproep automatisch starten:
> Schreeuw om hulp!

**Wachtstand (HUD-flavortekst terwijl de klok loopt)**
- Voor Fenna: "Blijf schreeuwen. Je vrienden moeten snel naar de herberg komen."
- Voor de anderen: "Blijf bij Fenna. Houd vol tot er genoeg hulp is."
- [UI: teller "Binnen X / 3" plus "Resterend: X sec"; timer HERBERG_TIMER_SEC = 30.]

**Aankomende speler treft Fenna (niet-Fenna gaat naar boven)**
> Je stormt de kraakende trap op. Boven staat Fenna, tegen de muur gedrukt, doodsbang, starend het donker in.
> De lucht klopt niet. Iets fluistert. Iets lacht.
> Wat is dit...
- [Knop: Ga snel bij haar staan]

**De heks vertrekt (identiek bij succes en falen)**
> Ik kom terug, vogeltje... voor elke noot.

Daarna:
> Je ogen moeten wennen aan het licht.

**Ontwaken (titel: Zolderkamer)**
> Ugh... het licht.

**Nasleep (gedeelde opening, alle rollen)**
> Je ogen scherpen zich. Het raam staat wijd open, de gordijnen waaien naar binnen. Buiten: niets. Geen gestalte, geen schaduw.
> Maar dan, beneden op de keien, vangt je oog iets kleins. Het beweegt in korte sprongetjes, weg van de herberg, richting het woud. Dan is het donker het te snel af.

Fenna, succes:
> Je haalt diep adem. Het is voorbij. Ze is weg, en jij staat er nog.
- [Knop: Naar beneden ↓]

Fenna, gefaald:
> Het is voorbij. De zolder is stil geworden, het gevaar geweken.
> En toch... er klopt iets niet. Alsof er iets met je is meegelopen, iets wat er eerst niet was. Je schudt het van je af. Waarschijnlijk de schrik.
- [Knop: Maar...] geeft [UI: item 🌑 De Schaduw], speelt de vloek-intro, daarna:
  - Fenna-Viviènne: "Heeft die heks dit gedaan? Die stemmen.. Auw.."
  - [Knop: Naar beneden ↓]

Andere rollen, succes:
> Fenna staat nog na te trillen, bleek van de schrik. Je blijft bij haar tot ze weer rustig ademt, en samen dalen jullie af.
- [Knop: Naar beneden ↓]

Andere rollen, gefaald:
> Fenna staat er stil bij. Ze glimlacht flauw dat het wel gaat, maar iets aan haar klopt niet. Alsof er een schaduw over haar heen ligt die er eerst niet was.
- [Knop: Naar beneden ↓]

**De herbergier op de trap (eerste afdaling na de scene, titel: De trap)**
> Halverwege de kraakende trap komt iemand je tegemoet gerend, de herbergier.
> Hij probeert te schreeuwen, te huilen. Maar zijn mond is dichtgenaaid met ruwe, donkere steken; er komt alleen verstikte lucht uit. Met wijde, paniekerige ogen stormt hij langs je heen, de zolder op.
- ⚠: "Wat hier ook gebeurd is, het is niet meer te stoppen."
- [Knop: Snel naar buiten →]

**Zolder in eind-staat (later eigen bezoek)**
Wie de scene zelf beleefde en de herbergier op de trap zag (lege kamer):
> De zolderkamer is leeg. Het raam staat nog open; buiten is het stil geworden.
> Van het briefje, de spiegel, de stem is geen spoor meer. Alleen de naklank van wat hier zonet gebeurde.
- ⚠: "Hier is niets meer te doen."

Wie beneden was (herbergier in de hoek):
> In de hoek zit de herbergier, knieën opgetrokken, schokkend. Hij probeert te huilen, maar zijn dichtgenaaide mond laat alleen verstikte lucht door.
> Hij kijkt niet op. Hier is voor hem niets meer te zeggen.
- ⚠: "Wat hier moest gebeuren, is gebeurd."

### DEEL 3 - De gelagkamer na de zolder-scene

**Jan**
- Jan: *(in gedachten)* "De herberg is stil. Stiller dan eerst."
> De stoel bij het haardvuur waar Mevr. van Wallingen zat, is leeg. Op de tafel staat haar halfvolle pul. Nog warm.
- Jan: *(in gedachten)* "Ze zat hier net nog. Niemand zag haar weggaan."
> In het raam zit een kikker. Hij draait zijn kop, kijkt Jan één tel aan, en hipt dan met een sprong het donker in. Weg.
- [Knop: Naar de zolder]

**Kelly**
> Kelly stapt binnen. De stilte raakt haar als koud water. De gasten zijn er nog, maar bewegen niet. Een man houdt zijn pul halverwege naar zijn mond. Bevroren.
> De bar is leeg. Op de vensterbank zit heel even een kikker. Hij knippert één keer, heel langzaam, en is met een sprong naar buiten verdwenen voor ze goed kijkt.
> Van boven komt een geluid, geen woorden. Alleen iemand die probeert te praten zonder dat het lukt.
- Kelly: *(in gedachten)* "Iemand huilt boven. Maar geen woorden. Alleen het geluid."
> Kelly stapt achteruit en gaat weg.
- [Knop: Naar de zolder]

**Fenna-Viviènne**
> Fenna ziet wat er gebeurd is. De herbergier is weg. Ze hoort hem boven, hij heeft geen woorden meer. Alleen lucht.
> Op de vensterbank zit een kikker die haar recht aankijkt. Dan, in één beweging, springt hij door het open raam en is weg.
- Fenna-Viviènne: *(in gedachten)* "Ik had hem niet kunnen redden. Maar het voelt anders."
- [Knop: Naar de zolder]

**Felix als Lucinde**
> Lucinde-Felix komt binnen. De stilte verrast haar, zelfs een oude dove dame voelt dit.
> Van boven hoort ze iemand huilen.
- Lucinde: *(zachtjes, voor zichzelf)* "Och, die arme man. Iemand zou hem moeten helpen."
> Maar niemand reageert. De gasten staren. De herbergier is weg.
- Lucinde: *(in gedachten)* "Niemand reageert. Niemand. Dat is erger dan het huilen zelf."
- [Knop: Naar de zolder]

**Felix als Lola**
> Lola walst binnen, maar haar pas haakt halverwege. Iets klopt niet.
- Lola: *(zacht, tegen zichzelf)* "Caramba. Hier is iemand weg."
> Lola is geen vreemde van gevaar. Ze voelt het. En vertrekt zonder nog een woord.
- Lola: *(in gedachten)* "Niet jouw verhaal vanavond, Lola."
- [Knop: Naar de zolder]

**Felix zonder vermomming**
> Felix komt binnen na de paniek. De stilte slaat hem in zijn gezicht.
> De vrouw die op Mevr. van Wallingen leek, weg. Stoel leeg. De pul nog op tafel. Op de vensterbank zit nog net een kikker, die meteen wegspringt, het donker in.
- Felix: *(in gedachten)* "Eerst zat ze daar. Nu niet. Geen mens loopt zo snel een herberg uit in stilte. Iemand zou het horen."
- [Knop: Naar de zolder]

**Fallback (overige)**
> De herberg is stil. De gasten staren naar niets. Op de vensterbank zit een kikker, die wegspringt zodra je binnenkomt.
- [Knop: Naar de zolder]

### Late fase - Heer Donatuslaan open

**Gespannen drukte (Fenna nog niet bij gemeentehuis; alle rollen)**
> De herberg zit vol. Strakke gezichten en een mix van onvrede en woede. Veel mensen hebben hun monden dichtgenaaid. Het is een beklemmend gezicht.
> Je houdt je gedeisd. Dit kan elk moment omslaan.

**De kokende zaal (na de gemeentehuis-vlag)**

Fenna, stap 0:
> Je stapt de herberg binnen. Het zit bomvol en de sfeer is ronduit vijandig. Mensen zijn bang, boos, opgejut. De hele meute lijkt in paniek, alsof het slechtste in de mens naar boven komt.
> Op een verhoging staat de burgemeester. Hij probeert de boel te sussen, maar niemand luistert echt naar hem. Dit kan elk moment heel lelijk worden.
> Dit vraagt om mij.
- [Knop: Stap het podium op]

Fenna, stap 1 (op het podium):
> Je stapt het podium op. De zaal draait zich naar je toe, boos en luid.
- Fenna-Viviènne: "Eén lied. Het juiste lied. Dan heb ik ze."
- [Mechaniek: FennaLied lied-doolhof 'herberg'; geen terug-knop, geen beeldblok. Bij succes door naar stap 2.]

Fenna, stap 2 (titel: De achterdeur, geen terug-knop):
> De zaal hangt aan je lippen, en het gemopper heeft plaatsgemaakt voor gezwijmel. Precies waar je ze wilt hebben.
> De burgemeester baant zich een weg naar het podium en grijpt je hand met beide handen vast.
- Burgemeester: "Fenna-Viviènne, dankjewel. Oprecht! Het hele dorp is van slag. Zelf ben ik ook een onderzoek gestart, maar als er iets is wat jij en je vrienden kunnen doen: help ons!"
- Fenna: "Ik ben over een uurtje terug. Jullie wachten toch wel op deze dame?"
> Je glipt snel via de achterdeur naar buiten.
> Dit houdt de boel voorlopig wel rustig. Voorlopig...
- [Knop: De straat op]

Andere rollen (kokende zaal):
> De herberg zit bomvol en de sfeer is ronduit vijandig. Mensen zijn bang, boos en opgejut, de hele meute lijkt in paniek. Dit kan elk moment heel lelijk worden.
> Je houdt je gedeisd. Hier valt op dit moment niets uit te richten. Dit is iets voor iemand die een zaal kan bespelen.

**Na Fenna's zang (dromerige zaal)**

Fenna:
> De zaal die eerder kookte, hangt nu rozig in de banken. Dromerige blikken, halve glimlachjes. Zodra je binnenkomt gaat er een zucht door de herberg, en tientallen ogen volgen je alsof je elk moment weer kunt gaan zingen.
- Fenna-Viviènne: "Nog steeds betoverd. Uiteraard. Kwaliteit slijt niet."
> Ergens achterin neuriet iemand zachtjes jouw lied. Vals. Je vergeeft het ze, voor deze ene avond. Maar niet te lang blijven, straks beginnen ze nog om een toegift te roepen.

Andere rollen:
> De herberg zit vol. Iedereen oogt wat rozig en dromerig, alsof ze nog ergens van nagenieten. Of van iemand...

---

## DD5 - Het Woud

Sub: "Een gesloten poort, vol doornen en mos". De poort is dicht tot alle vijf
de missie-sleutels binnen zijn en de speler de Sleutel Woudpoort heeft. Aan de
poort zit Tobbe, die door elke vermomming heen kijkt en per rol iets anders
laat vallen.

### Staat 1 - Poort dicht

**Jan, eerste bezoek (zet jan_woudpoort_gezien)**
> Een zware ijzeren poort, dichtgegroeid met doornen en mos. Achter de spijlen: donker bos. Geen vogels.
> Op een stronk naast de poort zit een jongen van een jaar of elf. Strohoed schuin, vies, knagend op een rauwe wortel. Hij gooit kiezels naar het slot. Klink. Klink.
- Tobbe: *(zonder op te kijken)* "Zit op slot. Hoef je niet aan te trekken."
- Jan: "Wie ben jij?"
- Tobbe: "Tobbe. Knechtje van Stoop. Maar ik loop weg als ik geen zin heb. Stoop maakt zich wel weer ongerust. Doet hij altijd."
- Tobbe: "Mensen proberen wel eens. Door de poort. Niemand komt erdoor. Dat slot is taai."
> Hij kijkt nu wél op. Recht in Jans ogen.
- Tobbe: "Behalve als je 'm zelf maakt natuurlijk. Een sleutel. Maar dan moet je weten hoe het slot van binnen werkt. En dat weet niemand."
- ⚠ Slip-up: "Niemand heeft hem verteld dat jij sloten maakt."
- Tobbe: *(gooit weer een kiezel)* "Stom hè. Sloten."
> Hij grijnst. Vies en scheef.
- Jan: *(in gedachten)* "Dat kind weet wat ik denk. Of het is toeval. Toeval is meestal geen toeval."
- Jan: *(in gedachten)* "Een sleutel maken, daar heb ik een afdruk voor nodig. Klei... waar vind ik dat? Iets met water, misschien in het Kraaienkwartier."

**Jan, poort al gezien, nog geen klei**
- Tobbe: "Nog steeds geen sleutel? Tss."
- Jan: *(in gedachten)* "Ik moet ergens klei vinden. Iets met water in de buurt, daar moet ik zoeken."

**Jan, terug met klei (afdruk maken)**
> Jan komt terug met de klei. Tobbe zit weer op zijn stronk, met een nieuwe wortel. Of dezelfde, niemand weet het.
- Tobbe: "Daar ben je weer. Met modder."
- Jan: "Klei. Niet modder."
- Tobbe: *(haalt schouders op)* "Modder met poespas eromheen. Wat ga je doen?"
- Jan: "Daar heb jij niks mee te maken."
- Tobbe: *(grijnst)* "Hoeft ook niet. Stoop zegt: hoeven en willen zijn twee dingen."
> Hij staat op en slentert weg langs de poort. Onderweg fluit hij iets, vals, vier noten, steeds hetzelfde rondje. Geen melodie. Een patroon.
- Jan: *(in gedachten)* "Hij blijft niet kijken hoe ik het doe. Of hij hoeft niet. Hij weet al hoe het gaat."
- [Knop: 🔲 Maak de afdruk] verwijdert de klei, geeft Klei-afdruk, zet jan_afdruk_gemaakt.

**Jan, met afdruk (terug naar de klokkenmaker)**
> De afdruk zit veilig in je tas. De stronk naast de poort is leeg, Tobbe is alweer ergens anders.
- Jan: *(in gedachten)* "Nu nog ergens de sleutel maken. Vast wel een plek hier in Dorendael, een werkplaats of zoiets."

**Kelly**
> Kelly nadert de poort. Tobbe zit op zijn stronk en neemt haar in zich op met een blik die langer duurt dan een kinderblik hoort te duren.
- Tobbe: "Wat moet jij hier."
> Het is geen vraag.
- Kelly: "Ik kijk gewoon rond."
- Tobbe: "Iedereen kijkt rond. Niemand kijkt naar binnen."
> Hij wijst met zijn wortel naar de poort.
- Tobbe: "Daar wel. Daar gaat niemand. Maar dat hek houdt geen bos tegen. Bossen blijven niet gevangen. Dat weet iedereen. Behalve volwassenen."
> Hij staart Kelly aan. Vies gezicht, blauwe ogen, dodelijk serieus.
- Tobbe: "Jij ziet veel hè. Je kijkt naar dingen die andere mensen niet zien. Heb je dat al lang?"
- Kelly: *(ongemakkelijk)* "Ik ben gewoon op zoek naar-"
- Tobbe: "Naar iets. Dat geloof ik. Iedereen is op zoek naar iets."
> Hij springt van de stronk en loopt achter de poort langs, uit zicht.
- Kelly: *(in gedachten)* "Dat kind ziet er normaal uit. Maar wat hij zegt is niet normaal."

**Fenna-Viviènne (slip-up; één regel afhankelijk van meisje_afgeleverd)**
> Fenna nadert de poort. Tobbe zit te lurken op zijn stronk, ziet haar aankomen en zet zijn strohoed wat rechter.
- Tobbe: "Mooie mevrouw."
- Fenna-Viviènne: "Dank je, schat."
- Tobbe: "Ze zeggen dat u kan zingen. Bij de vijver."
- Fenna-Viviènne: "Wie zegt dat?"
- (Merel al thuis) Tobbe: *(haalt schouders op)* "Mensen. Veel mensen. Merel ook. Stil meisje. Praat niet zo vaak. Goed dat ze haar kikker terug heeft."
- (Merel nog niet thuis) Tobbe: *(haalt schouders op)* "Mensen. Veel mensen. Dat stille meisje ook. Die met die kikker. Hangt altijd bij de vijver. Niet erg sociaal."
> Fenna verstijft.
- Tobbe: "Maar mevrouw, u bent best knap voor uw leeftijd hoor. Voor nu dan."
- ⚠ Slip-up: "Een kind van elf voorspelt geen veroudering."
- Tobbe: *(kantelt zijn hoofd)* "Want dat gaat hard hè. Het uiterlijk. Vooral als er dingen gebeuren. Lelijke dingen. Oude dingen."
> Hij grinnikt. Een hoge kinderlach, die te lang aanhoudt.
- Fenna-Viviènne: *(in gedachten)* "Welk kind zegt zoiets. Wélk kind."

**Felix als Lucinde**
> Lucinde-Felix waggelt naar de poort. Tobbe ziet haar aankomen en herkent haar direct.
- Tobbe: "Plakbaard-mevrouwtje. Doe maar niet."
- Lucinde: *(improviseert)* "Wat zeg je, lieve jongen?"
- Tobbe: "Dat zie ik. Je lippen zitten nog onder de baard. En je doet alsof je iemand anders bent dan toen je me bij die put zag."
> Hij wijst met zijn wortel.
- Tobbe: "Bemoei je met je eigen. Laat mij erbuiten."
> Lucinde maakt een vaag excuus en waggelt weg.
- Felix: *(in gedachten)* "Hmm, dat jong is niet zoals hij lijkt."

**Felix als Lola**
> Lola walst naar de poort. Tobbe knijpt zijn ogen samen zodra hij haar ziet.
- Tobbe: "Niet weer. Met die slordige baard."
- Lola: "Pequeño-"
- Tobbe: "Doe maar niet. Je hebt me al genoeg gestoord. Met je vermommingen en je gesnuffel. Loop door."
> Hij snauwt. Een snauw die niet bij een kindergezicht hoort.
- Tobbe: "Bemoei je met je eigen zaken voor één keer. Of moet ik weer terug naar Stoop omdat jij dat zo nodig wilt?"
- Felix: *(in gedachten)* "Hmm, dat jong is niet zoals hij lijkt."

**Felix zonder vermomming**
> Felix nadert de poort. Tobbe zit op zijn stronk en kijkt hem aan. Zijn blik verhardt zodra hij Felix herkent.
- Tobbe: "Jij."
- Felix: "Hé jochie. Druk?"
- Tobbe: *(knaagt aan zijn wortel, kijkt strak)* "Bemoei je met je eigen zaken. Je hoeft me niet terug te brengen naar die ouwe slofkop, snap je? Ik loop weg wanneer ik wil. Niet jouw probleem."
- Felix: *(in gedachten)* "Wacht. Dat kind van de put. Hij denkt dat ik hem verklikt heb. Hij was helemaal niet verdwaald. Hij was bewust weg."
- Felix: *(vlot, herstellend)* "Rustig joh. Ik was niet van plan iets tegen Stoop te zeggen."
- Tobbe: "Maakt niet uit wat je van plan was. Je deed het."
> Hij staart Felix aan. Te lang.
- Tobbe: "De poort is dicht. Zelfs jij kan er niet door. Loop maar verder."
- Felix: *(in gedachten)* "Hmm, dat jong is niet zoals hij lijkt."

**Overige rollen (fallback)**
> Een zware ijzeren poort, dichtgegroeid met doornen en mos. Achter de spijlen: donker bos. Geen vogels.
> Op een stronk zit een vieze jongen met een strohoed op een rauwe wortel te knagen.
- Tobbe: "Zit op slot. Hoef je niet aan te trekken."

### Staat 2 - Sleutel gemaakt, rest van Dorendael nog niet af

> De sleutel zit in je tas, zwaar en koud. De poort wacht.
- Tobbe: "Bijna zover. Maar nog niet. Eerst de rest, hè."
- ⚠: "Het woud is nog niet klaar voor je. Rond eerst alles in Dorendael af."

### Woudpoort-sleutel-flow (cross-locatie, Jan)

De sleutel loopt over drie locaties. In DD5 zelf gebeurt alleen het afdruk
maken (Staat 1). De twee andere stappen horen bij hun eigen locatie:

- K1 Dorpsput (klei pakken), verschijnt na jan_woudpoort_gezien:
  - Jan: "Die afdruk, dat slot op de woudpoort. Daar heb ik iets voor nodig. Iets zacht, iets wat de vorm vasthoudt."
  > De put-rand is bemost en nat. Tussen de stenen zit zachte, vochtige klei, perfect om een afdruk mee te maken.
  - [Knop: 🟫 Pak klei mee] geeft Klei, zet jan_klei_gepakt.
  - [Knop: 🚪 Snel terug naar de woudpoort]
- DD7 Klokkenmaker / werkplaats (sleutel smeden), zie DD7:
  > De werkplaats-deur staat nog open.
  - Jan: *(in gedachten)* "Alles wat ik nodig heb."
  > Hij legt de klei-afdruk klaar, kiest het juiste materiaal, vijlt en vormt.
  - [Knop: 🗝️ Maak de sleutel] verwijdert de klei-afdruk, geeft Sleutel Woudpoort, zet sleutel_woudpoort_gemaakt. Lade "🗝️ De sleutel is gemaakt": "Een perfecte sleutel voor het woudpoort-slot. Klaar."

### Staat 3 - Doolhof (Het Verweerde Woud)

Zodra alle vijf de missie-sleutels binnen zijn en de speler de Sleutel
Woudpoort heeft, bouwt DD5 het doolhof. Tobbe is weg. Bij het starten valt
eerst een zwarte regen-cinematic, dan begint de storm.

- [Knop: Vind je weg]
- [Mechaniek: doolhof, 4x4 grid. Route uit de win-tekst: Links, Links, Links, Vooruit, Vooruit, Rechts, Rechts, Vooruit, Vooruit.]

Intro:
> Jullie openen de poort. Erachter ligt een duister deel van het woud.
> Je kijkt nog even achterom terwijl je naar binnen loopt, maar de ingang verdwijnt al gauw uit het zicht.

Onderschrift:
> Een open plek tussen de bomen

Bij fout (heks):
> Een schorre lach, alles wordt zwart.
> Je ontwaakt bij de ingang.

Win-scherm, titel "Je bent uit het woud":
> Deel de route met de rest: Links, Links, Links, Vooruit, Vooruit, Rechts, Rechts, Vooruit, Vooruit.

### Staat 4 - Na het doolhof (wachten op de anderen)

Zolang niet iedereen klaar is, is de terugknop verborgen.

> WACHTEN OP DE ANDEREN
> X / 4 spelers uit het woud
> Geef je route door en wacht tot iedereen eruit is.

Iedereen uit het woud:
> IEDEREEN IS UIT HET WOUD
- [Knop: Klaar] (per rol). Daarna: "X / 4 klaar, wachten op de anderen..."

Zodra alle vier op Klaar drukken, start op elke tablet de woudscène.

### Staat 5 - Woudscène (de drie heksen)

Filmische scène (module technischefiles/woudscene.js). Sprekers: rechts /
links / midden (de drie heksen, midden = Sybille) en app (verteller). Beat 1
t/m 8 klikken door, beat 9 loopt vanzelf af terwijl het beeld naar zwart zakt.

- (rechts) "Jullie zijn ver gekomen."
- (rechts) "Maar dit is geen einde."
- (rechts) "Eén van ons hebben jullie in het Kraaienkwartier gezien."
- (links) "En één hier."
- (rechts) "Nu ken je ons alle drie."
- (rechts) "Terwijl jullie liepen te zoeken, hebben wij gewerkt."
- (links) "Eén straat is vanavond al stil. De monden dicht, de draad erdoorheen."
- (rechts) "Het hele dorp was aan de beurt. En daarna de rest."
- (links) "Maar jullie hebben ons gevonden. Dus wachten we niet meer."
- (links) "Het gebeurt vanavond. Alles."
- (midden) "Jullie zijn nog jong."
- (midden) "Let maar eens op wanneer hij avonden wegblijft. En niet zegt waar hij was."
- (midden) "Mannen."
- (midden) "Vreemdgangers. Vies."
- (midden) "IK HAAT JULLIE."
- (links) "Sybille."
- (rechts) "Rustig, kind."
- (app) "Ze bukt zich en plukt een van de rozen."
- (rechts) "Jullie mogen toekijken hoe het misgaat."
- (rechts) "En om zeker te weten dat jullie niet te veel in de weg lopen, nemen we er één mee."
- (app, beat 9, loopt vanzelf af) "Het licht in haar hand dooft."
- (app) "Je voelt het in je borst voordat je begrijpt wat het is."
- (app) "Je knieën geven mee."

Na de scène valt de vloek en ontgrendelt Heer Donatuslaan. Voor niet-Felix
verschijnt de lade "🌘 Jullie worden wakker"; Felix wordt wakker opgesloten in
zijn kamer (H2). Deze vervolgtekst hoort inhoudelijk bij Heer Donatuslaan.

### Staat 6 - Woud weer dicht (na Heer Donatuslaan)

> De poort naar het woud is weer dicht, overwoekerd met doornen en mos alsof er nooit iemand door is gegaan. Wat hier ook gebeurd is, het woud houdt zich stil. Hier valt niets meer te doen.

---

## DD6 - De Oude Molen

Sub: "Donker, vergeten, iets ruikt hier zoet". Twee fasen: bij het VERBODEN-bord
(Fase A) en de getimede molen-scène van 30 seconden (Fase B). Vanaf het bord
altijd [Knop: 🚶 Loop naar de molen] en [Knop: ← Loop terug]. Kelly vindt hier
het muziekdoosje.

### Fase A - Bij het bord (voor Heer Donatuslaan)

**Fenna-Viviènne**
> Fenna nadert het bord. Op een omgevallen boomstam staat een figuur met de rug naar haar toe, een vrouw, ouder, in donkere kleding. Ze beweegt niet.
> Fenna blijft staan. De figuur draait zich langzaam om.

Eerste ontmoeting:
- Fenna-Viviènne: "Pardon, ik ken u, geloof ik. Uit het Kraaienkwartier?"
- Mevr. van Wallingen: "Inderdaad, meisje. Ik woon daar al langer dan u zich kunt herinneren. En toch wandel ik vandaag graag. Hier."

Herhaalde ontmoeting:
- Fenna-Viviènne: *(verrast)* "Mevrouw van Wallingen, alweer?"
- Mevr. van Wallingen: *(glimlacht zonder warmte)* "Alweer. Druk dorp, hè meisje?"

Daarna in beide gevallen:
> Ze knikt naar het bord, naar de molen in de verte.
- Mevr. van Wallingen: "Mooi plekje, hè? Vroeger kwamen hier mensen graag. Toen woonden er nog mensen."
- Fenna-Viviènne: "En nu?"
- Mevr. van Wallingen: *(zachter)* "Nu komt er nog wel iemand. Maar niet om te wandelen."
> Ze wendt haar blik naar de bomen.
- Mevr. van Wallingen: "Loop maar door, kindje. Maar niet te lang. De wandeling is mooi. Het einde minder."
- Fenna-Viviènne: "Hoe weet u dat?"
- Mevr. van Wallingen: *(kijkt haar langer aan dan comfortabel)* "Ik kom hier vaker, meisje. Ik vind het rustig."
- Mevr. van Wallingen: "Niet iedereen die hier rondloopt is wat ze lijken. Maar dat geldt overal in dit dorp, hè."
> Ze glimlacht. Haar tanden zijn niet helemaal recht.
- Mevr. van Wallingen: "Vooral niet voor zo'n jong ding als jij. Pas op, meisje."
- Fenna-Viviènne: *(in gedachten)* "Ze komt hier vaker. Waarom zou iemand hier graag komen."

**Jan**
> Een houten bord op een paaltje, letters in het hout gebrand: VERBODEN TOEGANG — DE OUDE MOLEN. Daarachter een onverhard pad dat verdwijnt tussen kromme bomen. In de verte de molen: één wiek scheef, het dak half ingestort, zwarte vlekken waar ooit vuur was.
- Jan: *(in gedachten)* "Verboden toegang. Altijd een goede reden om juist te gaan."
> Er hangt iets in de lucht. Niet alleen de geur, iets in de stilte. Geen vogels. Geen krekels. Niets.
- Jan: *(in gedachten)* "Het is hier te stil. Veel te stil voor een bos."

**Kelly**
> Kelly leest het bord: VERBODEN TOEGANG — DE OUDE MOLEN. Ze wrijft over haar armen — kippenvel.
- Kelly: *(in gedachten)* "Verboden toegang. Maar mensen verbieden vaak juist de plekken waar antwoorden liggen."
> Ze kijkt naar de molen in de verte. De zwarte vlekken op de wanden.
- Kelly: *(in gedachten)* "Daar is iets gebeurd. Iets ergs. Ik moet weten wat."

**Felix**
> Felix nadert het bord en scant, gewoonte van vroeger. Geen mensen in zicht. Geen verse sporen op het pad.
- Felix: *(in gedachten)* "Een bord met VERBODEN is een uitnodiging voor mannen zoals ik. Of voor idioten. Tegenwoordig is het verschil moeilijker te zien."

Slotregel afhankelijk van de vermomming:
- Lucinde: *(in gedachten)* "Och, een verboden plek. Iemand wil een oud vrouwtje hier weghouden. Daarom ga ik juist kijken."
- Lola: *(in gedachten)* "Caramba. Verboden? Lola is geboren in 'verboden'."
- Felix (geen vermomming): *(in gedachten)* "Niemand ziet me. Goed."

**Fallback**
> Een houten bord: VERBODEN TOEGANG — DE OUDE MOLEN. Achter de kromme bomen ligt de molen, half ingestort, zwartgeblakerd.

### Fase A - Bij het bord (na Heer Donatuslaan)

> Een houten bord op een paaltje: VERBODEN TOEGANG. Het pad ligt er stil bij.

### Fase A - Donderbloesem-teaser (alleen als de apotheker-quest actief is en de bloesem nog niet verzameld)

- Verteller: "Verderop, bij de molen zelf, meen je tussen de verkoolde grond iets bleeks te zien groeien. Donderbloesem? Daarvoor moet je wel het pad af."

### Fase B - Betreden van de molen

Bij [Knop: 🚶 Loop naar de molen] eerst een volledig-scherm waarschuwing (alle rollen):
> Je staat tussen het puin. Je voelt het direct. Hier hoort niemand te zijn. Hier hoort niemand levend weg te gaan. Je hebt 30 seconden. Niet langer.

Daarna de 30-seconden-scène met ambient geluid, oplopende hartslag en een aftel-timer.
[UI: verborgen klikgebied op de molenruïne. Klikken geeft "Naald" (meervoudig item), zonder dialoog. Eerste speler wint.]

**Fenna-Viviènne**
- Fenna-Viviènne: *(in gedachten)* "Er beweegt iets. Achter de muur. Achter de balken. Het is groot."
> Half achter een ingestort stuk muur, een silhouet. Een vrouw, lijkt het. Of dat is wat haar hoofd ervan maakt. Het beweegt niet. Het ademt alleen.
- Fenna-Viviènne: *(in gedachten)* "Is dat... is dat de heks?"
> Op de grond ligt iets dat er ooit als kleding uitzag. Verschroeid. Met iets eronder dat lichter is dan zou moeten. Botresten. Niet groot. Niet volledig.
- Fenna-Viviènne: *(in gedachten)* "O god. Iemand is hier gestorven. Lang geleden, of niet zo lang. Ik kan het niet zien."
> Voetstappen, dichterbij. Het silhouet beweegt nu wél.
- Fenna-Viviènne: *(in gedachten)* "Wegwezen. Dit was ooit iemand. En dat 'iets' daar, leeft nog."

**Jan**
- Jan: *(in gedachten)* "Wat loopt daar? Iets groots? Meerdere dingen? Geen mens, toch?"
> De wiek boven hem kraakt. Schuift een halve centimeter zonder dat er wind is.
- Jan: *(in gedachten)* "De wiek beweegt. Er is geen wind."
> Net buiten zijn blikveld, achter een ingestort stuk muur, een schaduw. Mensvormig. Maar langer. Of gewoon een verkoolde balk. Hij kijkt niet nog een keer.
> Hij struikelt bijna. Over iets dat lichter is dan een balk maar zwaarder dan stof. Hij kijkt omlaag: een schedelfragment. Klein stuk. Verbrand, maar herkenbaar.
- Jan: *(in gedachten)* "Iemand is hier doodgegaan. Misschien meer dan één. Is dit waar de heks woont?"
> Voetstappen, dichterbij. Iets ademt.
- Jan: *(in gedachten)* "Wegwezen."

**Kelly, deel 1**
- Kelly: *(in gedachten)* "Er loopt iets. Maar er is ook iets om te vinden hier. Ik voel het."
> Bij haar voeten, half onder een verkoold houten kastje, glinstert iets. Heel zachtjes. Alsof het op haar wacht.
> Ze hurkt en schuift het kastje opzij, het valt bijna uit elkaar. Eronder: een muziekdoosje. Beschadigd, beroet, het deksel scheef. Bovenop iets gegraveerd, te zwart om te lezen.
- [Knop: 🎵 Pak het muziekdoosje] geeft het item (eenmalig, kelly_muziekdoosje_gevonden) en gaat door naar deel 2.

**Kelly, deel 2**
- Kelly: *(in gedachten)* "Voor wie was dit ooit? Zo klein. Zo lief gemaakt. Iets wat een vader voor zijn dochter zou maken. Voor haar eerste schooldag, misschien."
> Achter haar een schrapend geluid. Dichterbij nu. Maar haar oog valt op iets anders.
> Aan de muur, half tegen een verkoolde balk, hangt een pop. Van stof, met de hand genaaid. In de borst steken twaalf naalden in een keurige cirkel. Eronder een streng donker haar, lang, gevlochten alsof iemand er zorg aan besteedde.
> Op een verkoolde balk verderop is iets gekrast, onhandige letters, alsof iemand met een spijker werkte: "voor jou".
- Kelly: *(in gedachten)* "Iemand heeft hier iets verschrikkelijks gedaan. Met iemand die ze liefhadden. Een dochter, misschien? Wie doet dit met een kind?"
> In een hoek tegen de muur een hoopje stof, daaronder iets blekers. Een botfragment. Te klein om te identificeren. Maar het is daar.
> De voetstappen zijn dichterbij. Iets ademt.
- Kelly: *(in gedachten)* "Wegwezen. NU. Maar dit doosje neem ik mee. En die molen... hier moet ooit over geschreven zijn. Het archief. Daar zoek ik verder."

(Vangnet: pakt Kelly het doosje niet binnen de 30 seconden, dan krijgt ze het bij het aflopen van de timer alsnog.)

**Felix**
- Felix: *(in gedachten)* "Ik tel ze niet. Maar er is iets. Of meerdere iets."
> Felix is geen vreemde van gevaar. Maar dit voelt anders. Dit voelt alsof het hem kent.
> Hij stoot zijn voet tegen iets dat niet als hout klinkt. Hij kijkt omlaag: een kies. Menselijk. Met wortel. Er liggen er meer in het as, sommige verbrand, sommige niet.
- Felix: *(in gedachten)* "Iemand is hier vermoord. Of meerdere mensen. Is dit waar de heks haar werk doet?"
> Voetstappen achter hem. Heel dichtbij nu.

Slotregel afhankelijk van de vermomming:
- Lucinde: *(in gedachten)* "Ai lieverd, dit is geen plek voor wie dan ook."
- Lola: *(in gedachten)* "Madre mía. Lola is dapper, maar Lola is niet dom."
- Felix (geen vermomming): *(in gedachten)* "Mijn instinct zegt rennen. Mijn instinct is meestal goed."

**Fallback**
> Tussen het puin beweegt iets groots. Voetstappen, dichterbij. Wegwezen.

### Fase B - Donderbloesem plukken (alleen als de apotheker-quest actief is en de bloesem nog niet verzameld)

- Verteller: "Tussen de verkoolde grond, vlak bij je voeten, groeit iets grilligs. Kleine bleke bloemen. Donderbloesem."
- [Knop: 🌸 Pluk de Donderbloesem (snel!)] geeft het item via een korte toast (timer loopt door). Wie te laat is ziet "ℹ️ Al verzameld door een teamgenoot".

### Fase B - Ontwaken (na afloop timer, terug bij het bord)

- Fenna-Viviènne: "Ik stond bij de molen. Of dacht ik. Hoe ben ik terug?"
- Jan: "Wacht. Wat? Ik was net... hoe sta ik hier?"
- Kelly: "Ik was bij de molen. Het doosje, dat heb ik nog. Dat was geen droom. En het archief, dat was ik niet vergeten."
- Felix: "Iets wilde niet dat ik dichterbij kwam. Iets wil niet dat ik onthoud wat ik zag."
- Fallback: "Hoe ben ik hier weer terechtgekomen?"

### Fase B - Wacht-scherm (cooldown, meteen terug willen)

> Je voeten draaien al richting het pad. Maar iets in je benen wil niet mee.
- ⚠: "Je weet nog niet zeker of je terug wilt... Wacht nog even. Haal eerst adem."
- [Knop: ← Loop terug]

---

## DD7 - De Klokkenmaker

Sub: "Tikken, slingers, en een oude man". Twee sub-verhalen: Jan die de sleutel
smeedt (met afleiding door Lola) en Kelly die het muziekdoosje laat maken.

### Fase A - Winkel open (voor Heer Donatuslaan)

**Jan, eerste verkenning (nog geen klei-afdruk, nog niet eerder geweest)**
- Klokkenmaker: "Iets nodig, meneer?"
- Jan: "Ik kijk even rond."
- Klokkenmaker: "Kijken kost niets."
> Jan kijkt rond. Achterin de winkel ziet hij een werkplaats.
- Jan: *(in gedachten)* "Een werkplaats. Kan wel eens van pas komen, later."

**Jan, later bezoek zonder afdruk**
> De klokken tikken. De oude man buigt zich weer over zijn werk.
- Jan: *(in gedachten)* "Hier valt nu niets te doen."

**Jan, met klei-afdruk, eerste keer (toegangsvraag)**
- (indien nog niet eerder geweest) Jan: *(in gedachten)* "Ah, een werkplaats!"
- Klokkenmaker: "Iets nodig?"
- Jan: "Ik wil graag even gebruikmaken van uw werkplaats."
- Klokkenmaker: "Werkplaats is privé. Geen toegang."
- Jan: "Maar-"
- Klokkenmaker: "Geen toegang."
- Jan: *(in gedachten)* "Hij wil me niet binnenlaten. Misschien kan een van de dames hem afleiden..."
- [Knop: ⌛ Wacht bij de werkplaats-deur]

**Jan, wachtmodus bij de werkplaats-deur (geweigerd, nog niet afgeleid)**
Sub: Bij de werkplaats-deur
> Jan staat bij de werkplaats-deur. De klokkenmaker laat hem er niet langs.
- Jan: *(in gedachten)* "De klokkenmaker laat me niet binnen. Misschien kan een van de dames hem afleiden..."
- [UI: code-invoer. Label "Voer de code in die je van een medespeler hebt gekregen:", placeholder "Code...". Bij succes: "✦ De werkplaats-deur klikt open, een dame houdt de klokkenmaker buiten bezig." Bij fout: "Dat is niet de juiste code..."]

**Jan, met afdruk, klokkenmaker afgeleid, werkplaats nog niet geforceerd, mét speld**
Sub: De werkplaats
> De klokkenmaker is buiten, druk in gesprek met een dame in een rode jurk. Maar de deur naar de werkplaats zit op slot.
- Jan: *(voelt aan de speld in zijn zak)* "Dit slot is steviger dan die toren. Maar ik heb het eerder gedaan..."
- [Knop: 🔓 Forceer het slot met de speld] start de werkplaats-lockpick (2 rondes, 4 pins).

**Jan, afgeleid, nog niet geforceerd, GEEN speld**
Sub: De werkplaats
> De klokkenmaker is buiten, druk in gesprek met een dame in een rode jurk. Maar de deur naar de werkplaats zit op slot.
- Jan: *(in gedachten)* "Het slot is te sterk voor m'n blote handen. Had ik maar iets duns om mee te peuteren..."

**Werkplaats-lockpick (De Speld)**
Titel: De Speld / Sub: Forceer het werkplaats-slot
> Je schuift de speld in het slot. Dit is een ander beest dan die toren, steviger, complexer.
- Verteller: "Til elke pin tot de schaarlijn en zet hem vast."
- Tussentekst na grendel 1: "Er klikt iets. De eerste grendel geeft mee, maar er zit nog een tweede achter."
- Bij winst, lade "De deur gaat open": "De deur zwaait open. Maar de speld... knak. Gebroken. Balen, die was perfect. Zoiets vind je niet zomaar weer." [Knop: Naar binnen] plus [UI: toast "❌ Kromme Speld is gebroken"].
- Bij drie keer drie fouten (slot bezwijkt, leidt tot Schaduw):
  - Lade "Het slot bezwijkt": "Na al dat gewrik knakt er iets in het slot. De deur zwaait open." / "Maar de speld... knak. Gebroken. Balen. Die was perfect, zoiets vind je niet zomaar weer." [Knop: Naar binnen]
  - Lade "De werkplaats": "Je sluipt de werkplaats in. Alles wat je nodig hebt ligt hier." / "Maar iets voelt niet goed. Je hebt zijn slot geforceerd. Zijn werkplaats. Zijn vertrouwen." / "Misschien is dat een teken dat ik het niet had moeten d..." [Knop: Verder] gevolgd door blackout en de schaduw-vloek.
  - [UI: toast "❌ Kromme Speld is gebroken"; item De Schaduw toegevoegd]

**Jan, werkplaats al geforceerd (deur open)**
Sub: De werkplaats
> De werkplaats-deur staat nog open.
- Jan: *(in gedachten)* "Alles wat ik nodig heb."
> Hij legt de klei-afdruk klaar, kiest het juiste materiaal, vijlt en vormt.
- [Knop: 🗝️ Maak de sleutel]

**Jan maakt de sleutel**
[UI: klei-afdruk verdwijnt, Sleutel Woudpoort wordt gegeven, vlag sleutel_woudpoort_gemaakt gezet]
Lade "🗝️ De sleutel is gemaakt": "Een perfecte sleutel voor het woudpoort-slot. Klaar." [Knop: Verder →]

**Jan, na de sleutel (elk later bezoek)**
> De klokkenmaker zit gebogen over iets kleins. Hij sleutelt, intensief, geconcentreerd. Is het een muziekdoosje? Vanuit deze hoek niet goed te zien.
> Hij kijkt niet op.

**Kelly, met beschadigd muziekdoosje, nog niet ingeleverd**
- Klokkenmaker: "Mevrouw, ah. U brengt me wat."
- Kelly: "Dit. Het is beschadigd. Kunt u het maken?"
> Hij neemt het van haar over en draait het rond.
- Klokkenmaker: *(zacht)* "Niet echt mijn ding, muziekdozen. Klokken zijn mijn werk."
- Klokkenmaker: "Maar... mevrouw. Wat een delicaat meesterwerkje. Hier zit zoveel liefde en aandacht in."
> Hij kijkt op.
- Klokkenmaker: "Ik ga kijken wat ik voor u kan doen. Geen belofte. Maar ik ga kijken. Kom later terug."
- [Knop: 🎵 Geef het muziekdoosje af] Lade "🎵 Muziekdoosje afgegeven": "De klokkenmaker zet het doosje voorzichtig op zijn werkbank. Hij is geraakt. Echt geraakt."

**Kelly, muziekdoosje ingeleverd, nog niet klaar**
- Klokkenmaker: "Nog niet klaar, mevrouw. Komt u later terug?"
- Kelly: *(in gedachten)* "Hij is er nog mee bezig. Geduld."

**Kelly, geen doosje**
- Klokkenmaker: "Mevrouw."
- Kelly: "Ik kijk even rond."
- Klokkenmaker: "Doe maar."
- (als Jan op de code wacht) Kelly: *(in gedachten)* "Een eenzame man. Maar ik ben niet de juiste om hem af te leiden, ik durf niet zo te flirten. Misschien dat een halve dame meer succes heeft..."
- (anders) Kelly: *(in gedachten)* "Een eenzame man. Maar er is hier nu niets voor mij te doen."

**Fenna-Viviènne**
- Klokkenmaker: "Mevrouw."
- Fenna-Viviènne: "Goedendag."
- Klokkenmaker: "Iets nodig?"
- Fenna-Viviènne: "Ik kijk rond."
- (als Jan op de code wacht) Fenna-Viviènne: *(in gedachten)* "Een eenzame man. Iets voor een dame om af te leiden. Maar niet voor mij, een diva van mijn aanzien doet dat niet. Misschien dat een halve dame meer succes heeft..."
- (anders) Fenna-Viviènne: *(in gedachten)* "Een eenzame man. Maar er is hier niets voor mij te doen."

**Felix als Lola, klokkenmaker verliefd op afstand (Jan nog niet met afdruk geweest, Lola nog nooit binnen)**
> Lola loopt langs een winkeltje dat volhangt met klokken, slingers, wijzerplaten, getik achter het glas. Achter het raam staat een man haar na te staren. Zijn loep zakt van zijn oog, zijn mond valt half open; wat hij vasthoudt lijkt hij volledig vergeten.
> Hij blijft kijken tot ze bijna uit zicht is, met een blik die maar één ding kan betekenen.
- Lola: *(in gedachten)* "Zal wel de klokkenmaker zijn. Qué raro, die man. Helemaal betoverd, net als de rest. Claro: Lola Ramirez maakt alle mannen wild."

**Felix als Lola, de flirt-scène (Jan met afdruk geweest, Lola nog niet binnen)**
> Lola loopt binnen.
- Lola: "Ay! Wat een prachtige plek. Al deze klokken!"
> De klokkenmaker kijkt op.
- Klokkenmaker: "Mevrouw."
- Lola: "Vertelt u me eens, meneer, hoeveel jaar werk zit er in al dit?"
- Klokkenmaker: *(stottert)* "Tw... twintig jaar. Of meer."
- Lola: "Twintig jaar. Stelt u zich voor."
> Ze loopt naar de toonbank en buigt licht voorover.
- Lola: *(zachter)* "En al die tijd. Helemaal alleen?"
> De klokkenmaker probeert iets te zeggen. Het komt er niet uit. Lola's plakbaard hangt nu iets scheef, hij merkt het niet, hij kijkt overal behalve naar haar mond.
- Lola: "U heeft toch geen ring."
> Ze tikt zijn vinger aan.
- Klokkenmaker: *(kuchend)* "Nee. Geen ring."
- Lola: "Qué lástima. Iemand als u."
> Ze leunt verder. Haar baard hangt nu duidelijk scheef. De klokkenmaker is verloren.
- Lola: *(kantelt haar hoofd)* "Vertelt u me eens, wat is uw lievelingsklok in deze winkel?"
> Hij stamelt iets en wijst vaag naar een staande klok.
- Lola: "Laat u mij die eens zien. Vertel me alles."
> Ze pakt zijn arm en leidt hem zachtjes weg van de toonbank. Hij volgt als een lammetje, hij ziet niets behalve haar.
- Lola: "U bent een schat, meneer."
- [Knop: 💃 Rond de afleiding af] Lade "💃 Afleiding geslaagd": "Geef deze code mondeling door aan Jan, zodat hij de werkplaats in kan:" gevolgd door de code.

**Felix als Lola, code binnen, Jan nog niet door de deur**
Sub: Afleiding bezig
> Lola houdt de klokkenmaker bezig met haar verhalen. Hij hangt aan haar lippen en merkt niets van wat er achter hem gebeurt.
- Lola: *(in gedachten)* "Paciencia. Hou hem aan de praat, geef Jan de code, en blijf staan tot hij binnen is."
- [UI: code-sectie "Geef deze code mondeling door aan Jan:" met de code, daaronder "Je kunt pas verder zodra Jan door de werkplaats-deur is."]
- [Knop: ✓ Jan is door de deur] Lade "💃 Afleiding volbracht": "Lola werpt een blik over haar schouder, ziet dat Jan binnen is, en draait zich weer om naar de klokkenmaker. / 'Caramba! Kijk naar de tijd. Vamos, ik ben weg!'"

**Felix als Lola, terug na de afleiding (klokkenmaker idolaat verliefd)**
> Zodra de klokkenmaker Lola in de deuropening ziet, springt hij overeind. Een loep rolt van de werkbank; hij grijpt er niet eens naar.
- Klokkenmaker: "Mevrouw! U... u bent terug. Ik wist het. Ik bedoel, ik hoopte het."
> Hij strijkt haastig zijn dunne haar glad en stoot daarbij bijna een slinger om.
- Klokkenmaker: "Komt u binnen, alstublieft. Voor ú is er altijd tijd. Heeft u dorst? Ik heb thee. Ergens. Ik vind het wel."
- Lola: *(loom)* "Ay, zo galant. U verwent een dame, caballero."
> Hij lacht veel te hard, raakt de draad kwijt, begint opnieuw.
- Klokkenmaker: "Ik... ik heb vannacht aan u gedacht. Aan wat u zei. Over alleen zijn. Niemand vraagt me ooit zoiets."
> Hij pakt een fraaie klok van de plank en houdt hem haar bijna smekend voor.
- Klokkenmaker: "Neemt u deze. Ik wil er niets voor. Een vrouw zoals u hoort iets moois te bezitten."
- Lola: *(legt een vinger op zijn hand, duwt de klok zacht terug)* "Bewaar hem maar voor me, querido. Dan heb ik een reden om terug te komen."
> De klokkenmaker klemt de klok tegen zijn borst alsof het een belofte is. Hij volgt elke beweging van Lola met zijn ogen, idolaat, verloren.
- Lola: *(in gedachten)* "Pobrecito. Hij zou de hele winkel weggeven."

**Felix als Lucinde**
- Klokkenmaker: "Mevrouwtje. Kan ik u helpen?"
- Lucinde: "Och lieverd, ik kijk gewoon."
- Klokkenmaker: "Doet u maar rustig."
- (als Jan op de code wacht) Lucinde: *(in gedachten)* "Hij is vriendelijk, maar niet meer dan dat. Lucinde is geen dame voor hem, Lucinde is een oma. Lola zou hier beter passen."
- (anders) Lucinde: *(in gedachten)* "Vriendelijk, maar niet veel meer dan dat."

**Felix als zichzelf**
- Klokkenmaker: "Iets nodig?"
- Felix: "Ik kijk."
- Klokkenmaker: "Kijken kost niets."
- Felix: *(in gedachten)* "Hij doet aardiger tegen vrouwen dan tegen mannen."
- (als Jan op de code wacht) Felix: *(in gedachten)* "Een vermomming als dame zou hier veel meer doen."

**Fallback (overige rollen)**
> Tikkende klokken, een oude man met een loep gebogen over zijn werkbank.
- Klokkenmaker: "Kijk gerust rond."

### Fase B - Na Heer Donatuslaan (mond dichtgenaaid)

**Kelly, muziekdoosje al opgehaald (rustige scene)**
> Door het raam zie je de klokkenmaker aan zijn werkbank. Hij kijkt op, herkent je, en knikt langzaam. Meer hoeft niet.

**Kelly, doosje klaar, nog niet opgehaald (unlock via briefje bij Vrouwe Roet)**
> Door het raam zie je de klokkenmaker. Zijn mond is dichtgenaaid. Net als de anderen. Het is een verschrikkelijk gezicht.
> Maar als hij je ziet, staat hij meteen op. Hij gebaart. Kom. Kom binnen.
> Op de werkbank staat het muziekdoosje. Af. Hij schuift het voorzichtig naar je toe, alsof het van glas is.
- [Knop: 🎵 Neem het muziekdoosje aan] Lade "🎵 Het muziekdoosje": "De klokkenmaker legt het doosje in je handen. Zijn ogen glanzen. Hij kan niets zeggen, maar dat hoeft ook niet."
  - Als Kelly Aaltje in het Steegje al ontmoet heeft: "Je draait het doosje voorzichtig om in je handen. Het is prachtig geworden. En terwijl je kijkt, weet je het ineens. / 'Het vrouwtje in het steegje. Zij raakte me, zonder één woord te zeggen. Dit doosje hoort bij haar. Ik weet niet waarom. Maar ik weet het zeker.'"
  - Anders: "Je draait het doosje voorzichtig om in je handen. Het is prachtig geworden. Bijna te mooi. / 'Te mooi om zelf te houden, eigenlijk. Misschien kan ik er iemand in Heer Donatuslaan blij mee maken.'"

**Kelly, doosje nog niet klaar (hij wijst en schudt nee)**
> Door het raam zie je de klokkenmaker. Hij zit gebogen over zijn werkbank, zijn handen trillen.
> Zijn mond is dichtgenaaid. Net als de anderen. Het is een verschrikkelijk gezicht.
> Hij kijkt op als je voor het raam staat. Zijn ogen zoeken de jouwe. Dan wijst hij naar het muziekdoosje op de werkbank en schudt langzaam zijn hoofd. Het is duidelijk nog niet klaar.
- Kelly: "Nee... hij ook al." *(slikt)* "Dat doosje. Het is er nog. Maar het is niet af."

**Jan / Fenna / Felix (alle anderen dan Kelly)**
> Door het raam zie je de klokkenmaker. Hij zit gebogen over iets kleins op zijn werkbank. Zijn handen bewegen langzaam, maar geconcentreerd.
> Dan zie je het. Zijn mond is dichtgenaaid. Ook hij is slachtoffer geworden van de heksen.
> Hij kijkt niet op. Je besluit hem niet te storen.

---

## DD8 - De Stiltevijver

Sub: "Een vijver waar het wateroppervlak nooit beweegt". De grote Fenna-locatie:
ze zingt voor de treurende menigte, krijgt daarna het stille meisje Merel (met
de kikker Strix) en heeft een code van een teamgenoot nodig om vrij te komen.
Op de achtergrond duikt Mevr. van Wallingen op bij de kikker.

### Gedeelde bouwstenen

Sfeer (fase 1 en 2a, alle rollen):
> Bij de Stiltevijver staat een groepje mensen bijeen. Dit is de plek waar men heen gaat om iets te verwerken. Sinds het voorval eerder op de avond staan er meer dan anders: stille gezichten, een enkele die zacht praat, een paar die alleen maar naar het water staren.

Flard (fase 1/2a, willekeurig één, voorafgegaan door "Ergens vlakbij, half verstaan: "):
> "Ik wist niet waar ik anders heen moest vanavond."
> "Het is hier tenminste stil. Even niet nadenken."
> "Zo'n avond, daar kom je niet zomaar overheen."

Flard (fase 3, willekeurig één):
> "Het is voorbij voor vanavond, geloof ik."
> "Toch raar, dat kikkertje. Het zit daar maar."

Sfeer fase 3 (alle rollen):
> De Stiltevijver is rustiger nu. De menigte is grotendeels weg; enkele bezorgde mensen lopen nog langs het water, in zichzelf gekeerd. Op een steen aan de oever zit een kikker, doodstil. Dezelfde? Het lijkt er sterk op.
> Aan de rand staat Mevr. van Wallingen. Ze houdt de kikker niet vast. Ze kijkt er alleen naar.

Afsluiting fase 3 (alle rollen):
> Als je je omdraait en terugkijkt, is Mevr. van Wallingen weg. De kikker zit er nog.

### Fase 1 - voor Fenna's optreden

**Jan**
- Jan: "Veel bezorgde gezichten. Dit is geen plek om iets op te lossen. Dit is een plek waar mensen op adem komen. Iemand zou ze wat licht moeten brengen. Daar ben ik de man niet voor."

**Kelly**
- Kelly: "Stille mensen, stil water. Niemand zegt veel. Wat deze mensen nodig hebben, kan ik niet geven, in elk geval niet met woorden. Hier hoort iemand te zíjn die dat wél kan."

**Felix (zichzelf)**
- Felix: "Een treurende menigte. Mooie dekmantel om ongezien rond te lopen. Maar dit volk heeft geen ondervraging nodig. Het heeft afleiding nodig. Iemand met een podiumstem."

**Felix als Lola**
- Lola: "Ay, qué tristeza. Al die gezichten zo zwaar. In mijn land zou er nu muziek klinken. Verdriet dans je weg, je zwijgt het niet weg. Iemand moet hier zingen."

**Felix als Lucinde (afwijkende scene, geen flard maar een oude vrouw)**
> Naast Lucinde komt een oude vrouw staan. Ze staart over het water en begint te praten zonder haar aan te kijken, zoals oude mensen doen tegen wie ze vertrouwen.
- Oude vrouw: "De man van Nummer 10 stond hier vroeger elke avond. Roken, staren, net als wij nu. Al een heel seizoen niet meer gezien. Werk elders, zeggen ze."
- Verteller: "Een stilte. Dan, zachter:"
- Oude vrouw: "Zeggen ze."
- Lucinde: *(in gedachten)* "Twee keer op één dag over die man. En niemand die weet waar hij is. Dat is geen toeval meer."

### Fase 2a - Fenna komt aan (voor het zingen)

- Fenna-Viviènne: "Al die droeve gezichten... Dít is precies waarvoor ik besta. Even geen drama, geen onderzoek, gewoon een lied. Dit is wat ik te geven heb."
- [Knop: 🎤 Zing] Daarna:
  - Fenna-Viviènne: "Ze staan daar maar, met hun stille gezichten. Wat heeft deze avond nodig?"
  - [Mechaniek: FennaLied lied-doolhof 'stiltevijver'. Bij alle drie goed wordt fenna_vijver_vast gezet en gaat de scene door naar fase 2b.]

### Fase 2b - Fenna zit vast na het zingen

- Verteller: "Het lied sterft weg over het water. De mensen kijken op, sommige met natte ogen, maar lichter dan daarvoor. Eén voor één gaan ze naar huis, getroost."
- Verteller: "Op één na. Een meisje blijft staan. Op haar schouder zit een kikker, doodstil."
- Fenna-Viviènne: "Iedereen gaat naar huis. Behalve... zij. Waarom blijft dat kind staan? Ze klapt niet, ze huilt niet, ze beweegt niet. En die kikker..."
- Fenna-Viviènne: "Rillingen. Ik krijg er rillingen van. Is dit normaal? Dit is toch niet normaal?"
- Fenna-Viviènne: "Hé... ben je hier alleen? Waar zijn je ouders, lieverd?"
- Verteller: "Het meisje reageert niet. Ze staart."
- Fenna-Viviènne: "Vond je het lied mooi? Wil je... naar huis gebracht worden?"
- Verteller: "Niets. Geen woord. Alleen die blik."
- Fenna-Viviènne: "Ze zegt niks. Helemaal niks. Ik sta hier met een kind dat me aanstaart en een kikker die me aanstaart en ik weet werkelijk niet wat ik moet doen."
- Fenna-Viviènne: "Wie gaat me hier in hemelsnaam mee helpen? Zo kan ik niet werken. Ik heb iemand nodig."
- ⚠ Vastgelopen: "Je kunt niet weg. Iemand moet je helpen."
- [UI: code-invoer "Code van je teamgenoot". Bij juiste code: "✦ De code klopt, het meisje komt naar je toe.", vlag fenna_vijver_vrij, en de lade hieronder.]
- Lade "🧒 Het meisje gaat met je mee":
  > Het meisje draait haar hoofd, kijkt je voor het eerst écht aan, en steekt dan haar hand uit. Ze pakt jouw hand. Eindelijk.
  > Goed dan, je brengt haar naar dat huis verderop. Die kikker laat je zitten waar hij zit.
  > Breng het meisje naar het huis verderop. Zodra je haar daar afgeeft, gaat ze weer uit je inventaris.
  - [Knop: Begrepen →]

### Fase 2c - Kelly bij het meisje (Fenna zit vast)

**Kelly, nog zonder code gezien**
> Bij het water staat Fenna, duidelijk van slag, naast een meisje dat doodstil voor zich uit staart. Op de schouder van het kind zit een kikker, roerloos. Fenna kijkt op zodra Kelly aankomt.
- Fenna-Viviènne: "Goddank, jij. Dit kind zegt geen woord en het wijkt niet. Kun jíj iets met haar? Ik kom er werkelijk niet doorheen."
> Kelly gaat rustig naast het meisje staan en vraagt even níéts. Dan tilt het kind haar arm op en wijst. Naar een huis, een eindje verderop.
- Kelly: "Ze praat niet. Maar ze wijst. Dat huis daar, dat moet het zijn. Soms hoef je niet te vragen; je hoeft alleen te kijken naar wat iemand je probeert te laten zien."
- [Knop: Kijk waar ze naar wijst →] zet kelly_vijver_code_gezien en toont de code.

**Kelly, na de code gezien**
> Het meisje staat er nog, even stil, en kijkt zonder te knipperen. Kelly houdt de code voor Fenna paraat.
- [Weergave: blok "Code voor Fenna" met de code] gevolgd door: "Roep de code naar Fenna."

### Fase 2e - Jan / Felix treffen Fenna en het meisje (Fenna zit vast)

Gedeelde opening:
> Bij het water staat Fenna, duidelijk van slag, naast een meisje dat doodstil voor zich uit staart. Op de schouder van het kind zit een kikker, roerloos. Fenna kijkt op zodra je aankomt.
- Fenna-Viviènne: "Goddank, iemand. Dit kind zegt geen woord en het wijkt niet. Kun jíj iets met haar? Ik kom er werkelijk niet doorheen."

**Jan**
- Jan: "Een stil kind dat me aanstaart. Ik kan een slot openen met mijn ogen dicht, maar hier heb ik geen gereedschap voor."
- Jan: "Ik stap dichterbij en ze verstijft. Grote vent, grote schoenen, grote handen. Ik jaag haar alleen maar schrik aan. Sorry Fenna, dit moet iemand met een zachtere hand doen. Kelly, misschien."

**Felix (zichzelf)**
- Felix: "Het kind interesseert me niet. Die kikker wel."
- Felix: "Ik heb genoeg mensen geschaduwd om te weten wanneer iets terugkijkt. Dat beest knippert niet zoals een kikker hoort te knipperen. Het volgt. Het wéét."
- Felix: "Maar dat kind krijg ik niet aan de praat; ondervragen werkt niet bij wie niet bang is. Daar is iemand geduldigers voor nodig. Kelly heeft dat geduld."

**Felix als Lola**
- Lola: "Ay, mira ese sapo. Die kikker bevalt me niets. In mijn dorp zeiden de oude vrouwen: een dier dat te lang stilstaat, draagt iets dat niet van hem is."
- Lola: "Lola is van veel niet bang. Maar Lola weet ook wanneer ze het werk aan een ander moet laten. Dat stille meisje is iets voor Kelly. Paciencia, geen charme."

**Felix als Lucinde**
- Lucinde: "Hemeltje, wat een naar beestje op de schouder van dat kind. Het kijkt me aan, lieverd. Een kikker hoort niet zó te kijken."
- Lucinde: "Ik durf er bijna niet langs. Brrr. Nee, een oud vrouwtje als ik krijgt dat kind heus niet in beweging. Daar heb je iemand voor nodig die rustig blijft en goed kijkt. Die Kelly, dat lieve nauwkeurige ding."

### Fase 3 - na afloop, Mevr. van Wallingen (fenna_vijver_vrij)

**Fenna-Viviènne**
- Mevr. van Wallingen: "Mooi lied, vanavond. Het troostte de mensen. Maar niet alles wat luistert, heeft troost nodig. Sommige dingen luisteren om een andere reden."
- Fenna-Viviènne: "Hoe weet zij van mijn lied? En waarom kijkt ze naar die kikker terwijl ze het zegt? Ik moet hier weg."

**Kelly (met een opmaat voor de fase-3-sfeer)**
- Verteller: "Het meisje is met Fenna meegelopen. Bij het weggaan keek het nog één keer om, naar het water, niet naar Kelly."
- Kelly: "Ze ging mee. Mooi. Maar waarom keek ze nog één keer naar de vijver, en niet naar ons? Alsof ze daar iets achterliet."
- Mevr. van Wallingen: "Jij bent er eentje die kijkt. Dat zie ik. Een kikker krijgt geen ziel zomaar, kind. Onthoud dat."
- Kelly: "Een kikker krijgt geen ziel zomaar. Wat een vreemde zin om te zeggen. En ze zei het alsof ze precies wist dat ik zou luisteren."

**Jan**
> Ze knikt naar je zonder je aan te kijken; haar blik blijft op de kikker.
- Mevr. van Wallingen: "Grote mannen letten op grote dingen. Soms zit het kleine vlak voor je neus, op een steen."
- Jan: "Wat moet ik daar nou mee? Ze kijkt niet eens naar mij. Alleen naar dat beest."

**Felix (zichzelf)**
> Ze kijkt je nu wél aan, een tel te lang.
- Mevr. van Wallingen: "Een man die kijkt zoals jij kijkt, heeft al gezien wat ik zie. Een naam zegt soms meer dan een woord. Vraag je eens af hoe dat beestje heet."
- Felix: "Ze ruikt me. Niet letterlijk, maar ze weet dat ik kijk zoals zij. En ze stuurt me naar de naam van die kikker. Die onthoud ik."

**Felix als Lola**
- Mevr. van Wallingen: "Wat een kleurrijke verschijning. U bent niet van hier. Maar u kijkt naar dat beestje zoals de oude vrouwen uit úw land zouden kijken, met respect. Dat siert u."
- Lola: "¿Cómo lo sabe? Hoe weet dit oude mens van mijn land? En ze heeft gelijk, dit is geen gewone kikker. Las brujas houden zulke dieren. Lola weet dat van haar abuela."

**Felix als Lucinde**
> Mevr. van Wallingen verheugt zich, of doet alsof.
- Mevr. van Wallingen: "Lucinde! Wat heerlijk dat je er bent, schat. En wat zie je er... anders uit vandaag. Die baard staat je goed."
> Een korte stilte. Een glimlach die te veel weet.
- Mevr. van Wallingen: "Maak je geen zorgen, lieverd. Onder ons: ik zeg niets. Wij oude vriendinnen begrijpen elkaar. En tussen ons gezegd: blijf bij dat kikkertje uit de buurt. Daar weet ik van."
- Lucinde: "Ze doorziet me. Volledig. En tóch speelt ze mee, alsof ze het grappig vindt, of alsof het haar uitkomt. 'Daar weet ik van.' Hóe weet ze daarvan? Wie is dit mens eigenlijk?"

### Na Heer Donatuslaan (alle rollen)

> Bij de Stiltevijver is het rustig. Een handvol mensen staat langs de oever, sommigen alleen, anderen in stilte naast elkaar. Enkelen hebben hun monden dichtgenaaid. Een verschrikkelijk gezicht.
- Eigen personage: "Wat een verschrikkelijke avond."

---

## Opmerkingen bij de herevaluatie

1. Enkele stappen van de Dorendael-keten spelen buiten de DD-locaties en staan
   daarom in het overzicht bij de sleutel-flow genoemd, niet als eigen sectie:
   Jan pakt de klei bij de Dorpsput (K1), Kelly leest de Sybille-mythe in het
   Dorpsarchief (Dorpsplein) na de molen, en de heks-gok speelt op het podium
   (Dorpsplein).
2. De woudscène met de drie heksen (DD5, Staat 5) staat in het losse
   modulebestand technischefiles/woudscene.js, niet in zilverweide.html.
3. Em-dashes in speltekst, tegen de werkafspraak in. Verbatim geciteerd
   hierboven: DD3 (twee wijkwacht-regels, "op de wijkwacht af" en "Als u iets
   wilt zien") en DD6 (het molenbord "VERBODEN TOEGANG — DE OUDE MOLEN" op drie
   plekken, en Kelly's "over haar armen — kippenvel"). Deze kunnen los worden
   rechtgezet als mechanische fix.
4. Onaf/conditioneel materiaal: de Donderbloesem bij de molen (DD6) verschijnt
   alleen als de apotheker-quest uit Heer Donatuslaan actief is; dat is dus
   geen bug als hij ontbreekt.
5. De heks-gok (waar was de vermomde heks: antwoord Strix de kikker) speelt op
   het podium op het Dorpsplein en opent daarna het woud-doolhof (DD5). De gok
   staat daarom niet in dit per-locatie-overzicht; het doolhof en de woudscène
   wel.

---

## Stappenplan per speler

Dorendael is klaar zodra het team vijf missie-sleutels heeft verzameld:
sleutel woudpoort gemaakt (Jan), meisje afgeleverd (Fenna en Kelly), muziekdoosje
afgeleverd (Kelly), Sybille-mythe gelezen (Kelly) en herberg-scene voltooid
(Fenna en team). Daarna volgt de gezamenlijke finale.

### Jan (slotenmaker)

1. Ga naar de woudpoort (DD5). Tobbe laat vallen dat de poort alleen opengaat met een zelfgemaakte sleutel, waarvoor je een afdruk nodig hebt. Dit zet de klei-flow in gang.
2. Haal klei bij de Dorpsput (K1) in het Kraaienkwartier.
3. Terug bij de woudpoort (DD5): maak met de klei de afdruk.
4. Ga naar de Klokkenmaker (DD7). Hij laat je de werkplaats niet in; je hebt een dame nodig die hem afleidt (Lola). Wacht bij de werkplaats-deur en vul de code in die je van Lola krijgt.
5. Forceer de werkplaats-deur met de kromme speld uit het Kraaienkwartier (de speld breekt daarbij), of, als je 'm niet hebt, laat de dame afleiden en kom later terug.
6. Maak in de werkplaats met de afdruk de Sleutel Woudpoort (missie-sleutel).

### Kelly (onderzoeker)

1. Ga naar de Oude Molen (DD6). Loop de molen in (30 seconden) en pak het beschadigde muziekdoosje. Je hebt daarna reden om in het archief verder te zoeken.
2. Ga naar het Dorpsarchief (Dorpsplein) en doorloop het archief-doolhof. Zo lees je de Sybille-mythe (missie-sleutel "Sybille-mythe gelezen").
3. Ga naar de Klokkenmaker (DD7) en geef het muziekdoosje af om het te laten repareren.
4. Help Fenna bij de Stiltevijver (DD8): het stille meisje wijst een huis aan; geef Fenna de code zodat zij vrijkomt.
5. (Later in Heer Donatuslaan haal je het gerepareerde doosje op; dat valt buiten Dorendael.)

### Fenna-Viviènne (zangeres)

1. Ga naar de Stiltevijver (DD8) en zing voor de treurende menigte (lied-doolhof). Daarna blijft het stille meisje Merel achter, met de kikker Strix.
2. Je zit vast: roep je team. Kelly (of een ander) geeft je de code, zodat Merel met je meegaat.
3. Breng Merel naar Nummer 10 (DD3) en geef haar daar af (missie-sleutel "meisje afgeleverd").
4. Ga naar de Herberg (DD4) en loop naar boven, de zolder op. Lees het briefje van Robbie en doorloop de heks-scene. Je moet het volhouden tot je teamgenoten je komen bijstaan (missie-sleutel "herberg-scene voltooid").

### Felix / De Vos (spion)

1. Felix heeft in Dorendael geen eigen missie-sleutel, maar is onmisbaar als Lola: ga naar de Klokkenmaker (DD7) en leid hem af met de flirt-scene, en geef Jan de code zodat hij de werkplaats in kan.
2. Ga naar Nummer 2 (DD2) en kies in de achterkamer: wacht op de bewoner (veilig, levert de Munten van de Bewoner op) of steel de zak (levert de munten op, maar ook de schaduw-vloek). De munten heb je nodig voor de Lola-outfit.
3. Onderweg pik je overal aanwijzingen op: als Lucinde bij de buurvrouwen (DD3) en bij de vijver (DD8), zonder vermomming bij de wijkwacht (DD3). Let op: Tobbe bij de woudpoort (DD5) prikt door elke vermomming heen.

### Samen: de finale

Zodra de vijf missie-sleutels binnen zijn:

1. Ga naar het podium op het Dorpsplein. Eén speler claimt het stemrecht en wijst de vermomde heks aan. Het juiste antwoord is Strix, de kikker. Daarna opent het woud.
2. Ga naar de woudpoort (DD5), nu met de Sleutel Woudpoort, en doorloop het doolhof (Het Verweerde Woud). Deel de route met je team.
3. Wacht tot alle vier uit het woud zijn en iedereen op Klaar drukt. Dan speelt op elke tablet de woudscène met de drie heksen.
4. Na de scène valt de vloek en ontgrendelt Heer Donatuslaan. Felix wordt wakker opgesloten in zijn kamer (H2).
