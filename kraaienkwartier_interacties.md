# Kraaienkwartier: alle karakter-interacties per locatie

Overzicht voor herevaluatie van de teksten. Bron: de live renderfuncties in
zilverweide.html (renderK1Uitkijktoren, renderK1Groenteboer, renderK1Nachtenwens,
renderK1Dorpsput, renderK1Nummer7, renderK1Nummer5, renderK1Naaldmasker en hun
vervolgfuncties). Alle spelerstekst staat hier letterlijk, inclusief regie-
aanwijzingen tussen *( )*. Knoppen en UI-blokken staan als [Knop: ...] en
[UI: ...]. De oude teksten in de locatiesK1-data-array die in het spel niet
meer getoond worden, staan hier niet in (zie Opmerkingen onderaan).

---

## K1 - Het Kraaienkwartier (intro)

Geen karakter-interacties. Bij eerste binnenkomst alleen de kaart-uitleg
(overlay, voor alle rollen gelijk):

> Om je te helpen hebben we hier voor jou een kaart neergezet. Ben je ergens nog niet geweest, dan staat er geen naam. Zorg dat je overal heen gaat! En als je overal geweest bent, kun je soms ergens nog een tweede keer heen. Dat is soms slim en nodig.

---

## K2 - Stoop de Groenteboer

### Fase 1: Tobbe is weg (start)

Sfeer (alle rollen):
> Stoop staat achter zijn kraam. Hij is een ronde man met een schort vol vlekken, maar zijn gezicht staat somber. Zijn ogen dwalen steeds naar de straat. Tobbe.

**Jan**
- Stoop: "Vanuit die toren kun je vast wel ver kijken. Tobbe is weer eens weg!"

**Kelly**
- Stoop: "Jij hebt geen knechtje gezien hè? Tobbe heet hij."

**Fenna-Viviènne**
- Stoop: "Drukke dag, en m'n knecht is ook nog spoorloos."

**Felix**
- Stoop: "Heb jij Tobbe gezien? Klein joch, bruin haar. Werkt voor mij."

### Fase 2: Tobbe is terug (Felix heeft hem teruggebracht)

Sfeer (alle rollen):
> Stoop staat achter zijn kraam. Hij is een ronde, vrolijke man met een schort vol vlekken.

**Felix, eerste keer (beloning nog niet ontvangen)**
- Stoop: "Tobbe! Eindelijk. Jongen, waar heb jij gezeten?" Hij kijkt je dankbaar aan. "Hier, voor de moeite."
- Tobbe: *(zacht en te snel)* "Ik weet niet hoe ik daar terecht kwam. Ik was er gewoon. Niks gebeurd."
- [Knop: Munten aannemen] Daarna lade "Beloning ontvangen":
  > Stoop drukt je dankbaar een paar munten in de hand.

**Felix, latere bezoeken**
- Stoop: "Dankzij jou is m'n knechtje weer hier! Tobbe, kom 's groeten." *(Tobbe komt aarzelend dichterbij, ogen naar de grond.)*
- Tobbe: *(zacht en te snel)* "Ik weet niet hoe ik daar terecht kwam. Ik was er gewoon. Niks gebeurd."

**Felix vermomd als Lucinde**
- Stoop: "Goedemiddag mevrouw. Iets nodig vandaag?" *(fronst)* "...heb ik u eerder gezien? U komt me bekend voor." *(haalt schouders op)* "Ach, mijn geheugen ook..."
- Verteller: Tobbe kijkt net iets te lang naar Lucinde. Een lichte glimlach, niet uitgesproken.

**Kelly**
- Stoop: "Kijk eens, m'n knechtje is weer terug! Net thuisgebracht. Ze hadden 'm gevonden bij de dorpsput, van alle plekken." *(Tobbe mompelt iets, kijkt niet op.)*
- Tobbe: *(zacht en te snel)* "Ik weet niet hoe ik daar terecht kwam. Ik was er gewoon. Niks gebeurd."

**Jan**
- Stoop: "Ja Tobbe is terug! Die De Vos had 'm gevonden bij de put. Vreemd hè, hoe hij daar terecht kwam. Niemand weet het."
- Tobbe: *(zacht en te snel)* "Ik weet niet hoe ik daar terecht kwam. Ik was er gewoon. Niks gebeurd."

**Fenna-Viviènne**
- Stoop: "Wat een dag. Eerst was m'n knechtje weg, en net is ie teruggebracht. Bij de dorpsput hadden ze 'm gevonden. Bij de put! Het loopt vandaag allemaal raar."
- Tobbe: *(zacht en te snel)* "Ik weet niet hoe ik daar terecht kwam. Ik was er gewoon. Niks gebeurd."

### Fase 3: Dorendael open, Tobbe is opnieuw weg (alle rollen gelijk)

> Stoop staat achter zijn kraam, maar hij verkoopt niets. Zijn handen liggen stil op het hout. Naast hem staat een lege krat waar iemand op hoort te zitten.

- Stoop: *(zonder op te kijken)* "Tobbe is weer weg. Wat is het toch met die jongen."

> Hij haalt zijn schouders op alsof het hem niet raakt, en dat is precies waarom het je opvalt. Je hebt best medelijden met deze man. Hij geeft écht om die jongen.

---

## K3 - De Uitkijktoren

**Jan, eerste bezoek (onderaan)**
> Een smalle hoge toren aan het einde van een steegje. De deur zit op slot.

- Jan: *(kijkt omlaag)* "Hé, een kromme roestige speld naast de drempel." *(pakt hem op, bekijkt hem)* "Dun genoeg, en net de juiste kromming. Deze is perfect."
- [Knop: Probeer het slot te openen] Lockpick-intro:
  > Je schuift de kromme speld in het slot. Het mechanisme is oud en roestig, maar er zitten nog pinnen in.
  - Verteller: Til elke pin tot de schaarlijn en zet hem vast.
- Bij winst, lade "Het slot geeft mee":
  > De laatste pin klikt op zijn plek. Het slot draait open en de deur zwaait los. De speld is nog heel. Die kan nog van pas komen.
- Fail-safe na drie keer drie fouten, lade "Het slot begeeft het":
  > Na al dat gewrik springt het slot los. De speld is nog heel. Die kan nog van pas komen.

**Jan, latere bezoeken (onderaan)**
- Voor Dorendael open is: "Hmm, ik ben hier al opgeklommen, maar als het moet.." [Knop: Begin de klim]
- Daarna: "De torendeur staat nog open van de vorige keer." [Knop: Begin de klim]

**Jan, boven op de toren**
- Verteller: Van hier zie je het hele dorp.
- Observaties, Kraaienkwartier-fase:
  - "Daar op het dorpsplein, is dat het archief? Echt iets voor Kelly om in te duiken."
  - "Het podium… daar ligt nog van alles. Dat is vast iets voor iemand anders in de groep."
  - (alleen zolang de heks niet is opgelost) "Zit daar nu een vrouw in de tuin te huilen bij nummer 7? Hij kan het niet goed zien van hieruit..."
  - "Wat een uitzicht. Geen slecht idee om hier nog eens terug te komen."
- Observaties, Dorendael-fase:
  - "Wat hangt daar nu, een uithangbord met een klok erop? Te ver om te lezen wat er bij staat. Zulke borden hangen alleen bij vakmensen. Onthouden."
  - "Die oude molen steekt boven alles uit. Verbrand, naar het eruit ziet. Vergt onderzoek en daarna misschien het archief in duiken."
- Observaties, Heer Donatuslaan-fase:
  - "Bij het gemeentehuis brandt nog licht. De burgemeester zal wel druk bezig zijn met alle paniek in de stad. Iedereen sprak vandaag goed over hem. Licht betekent natuurlijk niet dat hij er ook echt is, maar toch."
  - "Is dat niet die criminele hangplek van, ach, hoe heet die troep ook alweer... Vergeten... Vrouwe Roet was de leider, geloof ik."
  - [Placefiller: hint Heer Donatuslaan 3]
- Kraaientelling (alleen na de diepere hint van de Verborgen Hand), overlay "Vanaf de toren":
  > Je laat je blik over de daken gaan. Op de nok, op een schoorsteen, op de rand van de put, op het uithangbord, op de goot van het huis daar beneden.
  > 5
  > Vijf kraaien. Je telt ze nog een keer, en het blijven er vijf.

**Kelly**
> Een smalle hoge toren aan het einde van een steegje. Je duwt tegen de deur, maar die zit stevig op slot.

- Kelly: "Hmm, hier kom ik niet in. Misschien kan iemand anders hier iets mee."

**Fenna-Viviènne**
> Een smalle hoge toren.

- Fenna-Viviènne: "Pff, sorry hoor. M'n jurk, m'n make-up, m'n haar, allemaal naar de knoppen door één trap. Niet doen."

**Felix**
> Een smalle hoge toren.

- De Vos: "Al die trappen? Dat trekken m'n knieën niet."

---

## K4 - De Nachtenwens (Mevr. van Wallingen)

### Kraaienkwartier-fase

**Jan**
> Een groter huis met een beeldig tuintje. Na lang kloppen doet een oude vrouw de deur een kier open, Mevr. van Wallingen. Ze kijkt wantrouwig en zegt niets.

- Mevr. van Wallingen: "Wat wil je? Ik ken jou niet en ik verwacht niemand. En al helemaal geen... slotenmakers. Ga weg. Nu."
- Verteller: *(de deur valt hard dicht)*

**Kelly**
> Een groter huis met een beeldig tuintje. Na lang kloppen gaat de deur een kier open.

- Mevr. van Wallingen: *(wantrouwig)* "Wie ben jij? Ik ken jou niet."
- Mevr. van Wallingen: "Ga weg. Die jeugd snapt het allemaal niet."
- Verteller: *(de deur gaat dicht)*
- Kelly: *(mompelt)* "Pff, wat een oude tang! Hoewel... dat is precies het type dat alles in de straat bijhoudt. Beter dan menig archief, durf ik te wedden. Als we haar aan het praten kunnen krijgen, misschien met de juiste vermomming?"

**Fenna-Viviènne**
> Een groter huis met een beeldig tuintje. Na lang kloppen gaat de deur een kier open.

- Mevr. van Wallingen: *(bekijkt Fenna traag van top tot teen, zonder iets te zeggen)* "...nee. Jij niet."
- Mevr. van Wallingen: *(hoofd schuin, iets vals om haar mond)* "Er zal een schaduw met je meelopen, kind. Nog niet. Maar binnenkort." *(glimlach zonder warmte)* "Al die make-up dekt het niet. Wij zien het toch wel."
- Fenna-Viviènne: *(deinst achteruit)* "Wat... wíj?"
- Verteller: *(de deur valt dicht. Achter het raam beweegt het gordijn.)*
- Fenna-Viviènne: *(kaak verstrakt)* "Ongelooflijk. Wéét ze wel wie ik ben? Een schaduw die met me meeloopt. Ik heb er een styliste voor, mevrouw, die volgt me overal." *(loopt al weg, maar blijft staan)* "...wij. Wie zijn 'wij'?"

**Felix zonder Lucinde-vermomming**
> Een groter huis met een beeldig tuintje. Na lang kloppen doet een oude vrouw de deur een kier open, Mevr. van Wallingen. Ze kijkt wantrouwig en zegt niets.

- Mevr. van Wallingen: *(wantrouwig)* "Wie ben jij? Ik ken jou niet."

**Felix als Lucinde, eerste bezoek**
> Een groter huis met een beeldig tuintje. Na lang kloppen gaat de deur open. Mevr. van Wallingen ziet je en haar gezicht klaart op.

- Mevr. van Wallingen: "Hehe, iemand met levenservaring! Kom binnen, kom binnen!"
- Mevr. van Wallingen: "Ach Lucinde, kom binnen. Eindelijk iemand met verstand."
- Mevr. van Wallingen: "Die vrouw van nummer 7... die heb ik al lang niet meer gezien. Heel lang. Vroeger kwam ze hier elke week, voor een praatje en een kop thee. Nu? Niets. Helemaal niets."
- Mevr. van Wallingen: "Haar man? Die zie ik wel. Maar anders dan vroeger. Veel anders. Hij heeft iets met haar gedaan, dat weet ik gewoon. Ik heb wel eens iets gezien... 's avonds laat... ik zeg niet wat. Maar het was niet goed."
- Mevr. van Wallingen: "En proberen erbij te komen? Onmogelijk. Die vent is zo verdomde beschermend. Iedere keer dat iemand aanbelt: eruit, wegwezen, boos."
- Mevr. van Wallingen: *(buigt naar voren)* "Weet je wat ik denk? Iemand moet die vent bezighouden. En ondertussen moet er iemand via de tuinpoort naar binnen. Even neuzen. Kijken wat er echt aan de hand is."
- Mevr. van Wallingen: *(zakt terug)* "Maar ik ben te oud voor dat soort dingen. Misschien kan jij... met wat hulp..."
- [Knop: Informatie ontvangen] Daarna lade "Sleutel Wallingen verkregen":
  > Je hebt met je team samen een belangrijke stap gezet en informatie ontvangen. Iedereen ontvangt een eindsleutel.

**Felix als Lucinde, eerste keer terug met de sleutel**
- Mevr. van Wallingen: "Nou Lucinde... fijn dat je er eens was. Nu ga jij je gang maar." *(zwaait haar weg, doet zachtjes de deur dicht)*

**Felix als Lucinde, latere bezoeken**
- Mevr. van Wallingen: "O, Lucinde alweer? Nou ja. Kom dan maar even binnen." *(kijkt spiedend de straat in voor ze de deur openhoudt)*

### Na Dorendael-unlock (alle rollen gelijk)

**Kraal-hint gekregen en apothekersquest actief, kraal nog niet gehaald**
> Een groter huis met een beeldig tuintje. Je klopt aan. Deze keer gaat de deur open, alsof ze je verwachtte.

- Mevr. van Wallingen: [Filler: *(kijkt je doordringend aan)* "Stazia heeft je gestuurd, nietwaar. Voor de kraal."]
- [Knop: 📿 Vraag naar de Kraal van Beengiht] Daarna lade "Kraal van Beengiht":
  > [Filler: Mevr. van Wallingen geeft, na enig aandringen, een kleine donkere kraal af. Uit Calovië, zegt ze. Hoe ze eraan komt vertelt ze niet.]
  > Breng dit naar de apotheker in Heer Donatuslaan.

**Kraal is al gehaald**
> Je klopt aan. De deur gaat op een kier.

- Mevr. van Wallingen: "Jullie hebben je kraal al. Weg!"
- Verteller: *(de deur valt dicht)*

**Anders: niemand thuis**
> Een groter huis met een beeldig tuintje. Je klopt aan. En nog eens. Er wordt niet opengedaan.

- Verteller: De gordijnen zijn dicht. Er is hier niemand.

---

## K5 - De Dorpsput

**Kelly, nog niet in de put**
> Kelly loopt nieuwsgierig dichterbij. Het steen is bemost, het water donker. Maar daar... iets blinkt op de bodem.

- [Knop: Dichterbij lopen...]

**Kelly, in de put (dagboek nog niet opgepakt)**
- Verteller: Het steen brokkelt af onder je voeten. Je valt! Het water is ijskoud.
- Verteller: Onderin zie je iets glinsteren...
- [UI: itemvondst "Nat Dagboek, tik om op te pakken. Doorweekt en onleesbaar. Ergens waar ze goed met papier overweg kunnen, misschien..."]
- [UI: "Je komt hier niet alleen uit. Roep je teamgenoten om hulp."]

**Kelly, in de put met dagboek**
- Verteller: Het dagboek zit in je tas. Nu jij er nog uit. Roep je vrienden om hulp: iemand daarboven moet de juiste code vinden en hem naar je roepen.
- [UI: code-invoer "Vul de juiste code in om hier uit te komen"; bij juiste code (XXX): "✦ Juist! Jan trekt je eruit!", bij fout: "Dat is niet de juiste code..."]

**Kelly en Jan, reünie na de redding (pop-dialoog op beide schermen)**
- Kelly: Jan, ik kan je wel kapot knuffelen! Ik wist dat jij me eruit zou krijgen.
- Jan: Hohoho, graag gedaan! Maar misschien moet je je eerst even afborstelen, boekenwurm.
- Jan (alleen zolang Tobbe nog niet gevonden is): Hé, maar Kel... hoor je dat gegniffel ook?

**Kelly, gered (latere bezoeken)**
> Een oude stenen put. Het water staat er stil bij.

**Fenna-Viviènne, terwijl Kelly vastzit**
> Een oude stenen put, bijna vergroeid met het straatwerk. Het steen is bemost en vochtig.

- Fenna-Viviènne: *(kijkt in de put)* "Kelly?! Hoe kom je daar nou in?!" *(strekt haar armen uit, bereikt haar bij lange na niet)* "Ik ben echt te klein voor dit. Dit is een geval voor Jan."

**Fenna-Viviènne, anders**
> Een oude stenen put, bijna vergroeid met het straatwerk. Het steen is bemost en vochtig.

- Verteller: Niets bijzonders hier voor Fenna.

**Felix** (sfeer altijd: "Een oude stenen put, bijna vergroeid met het straatwerk. Het steen is bemost en vochtig.")
- Terwijl Kelly vastzit:
  - De Vos: *(kijkt omlaag in de put)* "Kelly? Hoe... ach. Even kijken." *(strekt zijn arm uit, veel te kort)* "Mijn infiltratie-skills helpen me hier niet. Hier heb je die lange Jan voor nodig."
- Tobbe staat er nog (niet gevonden, geen munten):
  - Verteller: Dichtbij de put staat een schichtige jongen. Hij doet alsof hij verdwaald is: "O… ik wist niet dat ik hier was." Hij werpt een nerveuze blik richting de put.
  - Tobbe: "Ik werk bij Stoop, de groenteboer. Kun je me terugbrengen?"
  - [Knop: Neem Tobbe mee] Daarna lade "Tobbe gevonden":
    > Een schichtige jongen die beweert verdwaald te zijn. Hij zegt bij Stoop de groenteboer te werken.
- Tobbe loopt met Felix mee:
  - Verteller: Tobbe schuifelt achter je aan en kijkt schichtig om zich heen. Misschien moet je hem eerst even terugbrengen naar Stoop, voor je hier verder rondneust.
- Geen van beide actief:
  - Verteller: De put staat er stil bij.

**Jan, terwijl Kelly vastzit**
> Een oude stenen put, bijna vergroeid met het straatwerk. Het steen is bemost en vochtig.

- Verteller: Hoor je dat? Iemand roept om hulp uit de put!
- Jan: *(buigt over de rand)* "Kelly?! Hou vol, ik ben er."
- Verteller (alleen zolang Tobbe niet gevonden is): En ergens in de bosjes klinkt gegniffel.
- [Knop: 🤝 Help Kelly uit de put] Daarna:
  - Jan: *(over de rand)* "Ik haal je eruit. Luister goed en zeg me na, dit is de code:"
  - [UI: codeblok "Code voor Kelly" + "Roep de code hardop naar Kelly."]

**Jan, niemand in de put**
- Kelly al gered: "De put staat er stil bij." Plus, zolang Tobbe niet gevonden is:
  - Verteller: Dat gegniffel klinkt er nog steeds. Waar komt dat vandaan?
- Kelly nooit gevallen: "Een oude stenen put, bijna vergroeid met het straatwerk. Het steen is bemost en vochtig." Plus, zolang Tobbe niet gevonden is:
  - Verteller: Ergens in de bosjes klinkt gegniffel.
- Klei-flow (na het zien van de woudpoort, zolang er geen klei of sleutel is):
  - Jan: Die afdruk, dat slot op de woudpoort. Daar heb ik iets voor nodig. Iets zacht, iets wat de vorm vasthoudt.
  > De put-rand is bemost en nat. Tussen de stenen zit zachte, vochtige klei, perfect om een afdruk mee te maken.
  - [Knoppen: 🟫 Pak klei mee / 🚪 Snel terug naar de woudpoort]

---

## K6 - Nummer 7

### Pre-heks (per rol een eigen afwijzing)

Sfeer (alle rollen):
> Een gesloten huis aan het einde van de straat. Stil. Gordijnen dicht. Aan de zijkant is een smalle tuindeur. Zou die open kunnen?
> Een buurvrouw schuifelt voorbij en mompelt, half tegen zichzelf: "Vroeger stond die deur altijd open. Sinds zijn vrouw ziek is, laat die man zich amper nog zien."

**Jan**
- Verteller: Je klopt aan. De man doet open en jaagt je weg: "Wegwezen! Mijn vrouw heeft rust nodig!"
- De Man van Nummer 7: "Wat moet je hier? Wegwezen!"

**Kelly**
- Verteller: Je klopt aan. De man doet open: "Wat moet je hier? Hoepel op!"
- De Man van Nummer 7: "Mijn vrouw is ziek, die heeft rust nodig. Hoepel op!"

**Fenna-Viviènne**
- Verteller: Je klopt aan. De man doet open en snauwt: "Wegwezen! De volgende keer wordt het minder vriendelijk."
- De Man van Nummer 7: "Ik heb het je al een keer gezegd, wegwezen! De volgende keer wordt het minder vriendelijk."

**Felix**
- Verteller: Je klopt aan. De man jaagt je weg: "WEG!" De deur slaat dicht.
- De Man van Nummer 7: "WEG!"

### Post-heks: de finale (alle rollen samen)

De heks-gok zelf speelt op het podium op het Dorpsplein, niet hier.

**Aanwezigheids-gate (filmpje nog niet gezien)**
> Het huis aan het einde van de straat. De heks schuilt hierbinnen. Dit doen jullie samen, of niet.

- Verteller (zodra alle vier er zijn): Iedereen is er. De deur wacht.
- [UI zolang niet compleet: "Wacht op de anderen • x / 4 aanwezig"]

**Het plan (overleg op afstand)**
> Van een afstandje kijken jullie naar het huis. Donker, gesloten, net als altijd. Zomaar aanbellen heeft geen zin, dat weten jullie inmiddels.

- Lucinde: "Mevrouw van Wallingen had zo gek nog niet gedacht. Als iemand die man aan de voordeur bezighoudt, kan een ander achterom een kijkje nemen."

> Dat zou kunnen werken. Maar wie houdt hem dan bezig?

- Fenna-Viviènne: "Robbie. Een fan van mij. Die heeft al beloofd te helpen als het nodig is. Ik ga hem even halen."

> Jullie kijken elkaar aan. Dit gaan we doen. Iedereen knikt. Fenna glipt weg om Robbie op te halen.

**Ava-scene (achter het huis)**
> Jullie sluipen achterlangs en treffen hier de vrouw des huizes aan.

- Ava: "Jullie zijn er."

> Ze kijkt jullie aan en weet waarvoor jullie hier zijn.

- Ava: "Hij is binnen. Of nee, zij. Maar pas op... Niets is wat het lijkt."
- [Knop: 🚪 Naar binnen] Daarna het filmpje ("Zet het filmpje op volledig scherm en zet het aan.")

**Na het filmpje**
- Ava: "Mijn man, of nee... die heks... had het vaak over Dorendael. Misschien moeten jullie daar verder kijken."
- Ava: "Ik... Ik... ga even boven op bed liggen."
- [Knop: Verder] Daarna lade "Dorendael is toegankelijk!": "Dorendael verschijnt op de kaart."

### Na Dorendael-unlock (alle rollen gelijk)

> Het huis is stil. De gordijnen zijn dicht. Het valt je op dat er nu een kaars achter het raam brandt die er eerder niet stond.

- Eigen personage: "Laten we Ava nu maar met rust laten."

---

## K7 - Nummer 5 (Robbie Kweekel)

### Buiten, voor het aankloppen

**Standaard (alle rollen, en Fenna zonder verwachting)**
> Een smal stenen huis, midden in de rij. Boven de deur een verweerd bordje met een 5. Achter de bovenramen brandt licht, en er beweegt iets.
> De deur is dicht. Van binnen komt gedempt geluid: iemand die meezingt met iets, hard en vals.

- [Knop: ✊ Klop aan]

**Fenna, wordt verwacht (heeft de microfoon)**
> Nummer 5. De deur staat op een kier, alsof iemand hem expres niet dicht heeft gedaan.

- [Knop: 🚪 Loop naar binnen]

**Fenna, sleutel al verdiend**
> Nummer 5. De deur staat op een kier. Dat is sinds vanmiddag zo, en je vermoedt dat dat geen toeval is.

- [Knop: 🚪 Loop naar binnen]

**Fenna, al binnen geweest maar nog geen microfoon**
> Nummer 5. Achter het raam beweegt een gordijn, en meteen daarna staat het weer stil.

- Fenna-Viviènne: *(in gedachten)* "Hij zit daar op me te wachten. En ik heb nog steeds niets om hem te geven."
- Fenna-Viviènne: *(draait zich om)* "Eerst die microfoon. Dan pas terug."

### Aangeklopt

**Fenna-Viviènne, eerste bezoek**
> De deur zwaait open. Robbie Kweekel staat in de opening. Hij ziet jou, en zijn mond blijft openstaan.

- Robbie Kweekel: "Wie ben... wacht. Is dat... FENNA?! Fenna Vivienne?!"
- Robbie Kweekel: *(grijpt de deurpost, wordt bleek, dan rood)* "In mijn straat. Voor mijn deur. Kom binnen, kom binnen, ik wist niet dat, ik had, o god."

> Binnen is het klein en warm. Een vuur dat bijna uit is, een doorgezeten leren stoel, een krukje met een boek en een pijp die nog nasmeult. Buiten kleurt de lucht al roze achter de gordijnen.
> Boven de schouw hangt een groot geschilderd portret. Een vrouw met rood haar, in een rode jurk, ogen dicht, midden in een noot. Je kijkt er iets te lang naar.

- Robbie Kweekel: *(volgt je blik, wordt vuurrood)* "Dat is... dat is gewoon een schilderij. Van de markt. Toevallig."
- Robbie Kweekel: *(pakt je hand, laat weer los, durft niet)* "Zing iets. Alsjeblieft. Eén liedje. Ik vraag nooit iets aan niemand, maar dit vraag ik."
- Robbie Kweekel: "En dan doe ik daarna wat jij wilt. Wat dan ook. Ik meen het."
- Robbie Kweekel: *(kijkt wanhopig om zich heen)* "Maar zonder microfoon? Dat kan niet. Dat mag niet. Zo'n stem verdient beter dan mijn keukenmuren."
- Fenna-Viviènne: *(in gedachten)* "Ergens in dit dorp ligt een microfoon. Die vind ik wel."

**Fenna-Viviènne, met microfoon**
> Robbie zit voorovergebogen op zijn stoel, handen tussen zijn knieën, en kijkt op als je binnenkomt. Zijn ogen springen op bij het verschijnen van "zijn" Fenna.

- Robbie Kweekel: *(fluisterend, alsof harder praten het kapot zou maken)* "Je hebt er een."

> Tijd voor het lied.

- [Knop: 🎤 Zing voor Robbie] Lied-scene:
  - Robbie Kweekel: "Zing je iets voor mij? Alsjeblieft? Eén liedje maar!"
  - Fenna-Viviènne: Hij straalt helemaal. Nu alleen nog het juiste lied kiezen.
  - Bij succes, lade "Robbie is verkocht":
    > Als de laatste regel wegsterft, blijft het even helemaal stil.
    > Licht ontroerd zegt Robbie: "Ik sta klaar als jij of je vrienden mij nodig hebben."

**Fenna-Viviènne, sleutel al verdiend**
> Je duwt de deur open. Robbie zit in zijn stoel, en veert overeind zodra hij je ziet. Hij hoeft niets meer te vragen.

- Robbie Kweekel: "Dat ik dit mag meemaken. Fenna Vivienne in mijn huis die voor me gezongen heeft! Denk eraan: als het nodig is ben ik er voor je!"

**Jan**
> Robbie Kweekel doet open. Hij kijkt je van top tot teen aan met een arrogante blik.

- Robbie Kweekel: "Ja? Wat wil je?"
- Robbie Kweekel: *(kijkt je aan)* "Jij bent een beetje een softie of niet? Misschien moet je ook eens een tattoo nemen."

> De deur gaat dicht voor je iets hebt kunnen zeggen.

**Kelly**
> Robbie Kweekel doet open. Hij kijkt je aan en trekt een wenkbrauw op.

- Robbie Kweekel: "Kan ik je ergens mee helpen of zo?"
- Robbie Kweekel: *(neerbuigend)* "Ben jij ook lid van de Fenna Vivienne fanclub? Of ben je gewoon... toevallig hier?"

> Hij wacht je antwoord niet af. De deur valt dicht.

**Felix**
> Robbie Kweekel doet open. Hij werpt je een verveelde blik toe en wuift je weg.

- Robbie Kweekel: "Wat moet je? Ik heb het druk."
- Robbie Kweekel: *(wuift je verveeld weg, mompelt)* "...ouwe vent..."

> De deur gaat dicht.

### Post-heks of Dorendael open (alle rollen gelijk)

> Nummer 5. De ramen zijn donker, geen licht, geen geluid, geen vals meegezing.

- Verteller: Je klopt aan. Niets. Nog eens. Niets.

> Het ziet er te donker uit binnen. Zal er niemand thuis zijn?

---

## K8 - Naald en Masker (Madeleine)

### Buiten (alle rollen behalve Kelly na het hand-incident)

> Een houten uithangbord kraakt in de wind: Naald en Masker. Onder het afdak hangen maskers naast elkaar, holle ogen naar de straat gericht.
> Op de vensterbank zit een zwarte kat die niet wegkijkt als je nadert. Binnen brandt licht. Iemand beweegt.

- [Knop: 🚪 Ga naar binnen]

### Binnen, sfeer (alle rollen)

> De winkel ruikt naar stof en naaigaren, maar ook naar iets kruidigs, zoets, niet thuis te brengen. Langs de muren hangen pruiken in alle kleuren en een rij maskers.

- Verteller: In de hoek staat een paspop die er bijna te levensecht uitziet. Boven de deur is een symbool in het hout gebrand: een cirkel met een streep erdoor. Achterin: een deur op een kier met zwarte stof eroverheen.

### Kelly

**Eerste bezoek**
- Madeleine: *(kijkt op, ogen lichten op)* "Oh. Wat een lieverd." *(legt de naald neer, leunt voorover)* "Kom 's wat dichterbij, kind."
- Madeleine: *(bekijkt Kelly van top tot teen, glimlacht warm)* "Ach, wat een poezelige handjes heb jij. Echt zacht. Kom eens hier..." *(strekt haar hand uit. Open. Wachtend.)*
- [Knoppen: ✋ Geef je hand / 🚫 Trek je hand terug]

**Herhaalbezoek (hand nog nooit gegeven)**
- Madeleine: *(kijkt op. Glimlacht.)* "Daar ben je weer, lieverd. Wist ik wel." *(legt naaiwerk neer, leunt voorover)* "Kom, laat me die handjes nog 's zien. Ik ga ze heus niet stelen, hoor." *(strekt haar hand uit. Open. Wachtend.)*

**Met open rouwstof-quest (extra regel plus andere knoppen)**
- Madeleine: *(haar blik glijdt naar de donkere lappen achterin)* "Kind, kom je je hand aanbieden, zo poezelig? Of kom je voor iets anders?"
- [Knoppen: ✋ Bied je hand aan / 🖤 Ik kom voor iets anders]
- Bij "iets anders", lade "Rouwstof":
  > Madeleine kijkt je even aan, dan knipt ze zonder verder vragen een klein lapje af van een donkere jurk. Fluweel, versleten aan de randen.
  - Madeleine: "Ach, ook goed. Van een weduwejurk. Oud verdriet knipt makkelijk." *(geeft het lapje af alsof het niets is, maar haar blik blijft nog even op je handen rusten)*
  > Breng dit naar de apotheker in Heer Donatuslaan.

**Kelly geeft haar hand (horror-moment)**
- [UI: rood scherm met aftelklok]
  > Ze pakt je hand. Eerst zacht. Dan hard. IJskoud. Ze begint te lachen, eerst zacht, dan harder...
  > Ze laat niet los...
- Daarna lade "Ze laat los":
  > Ze pakt haar naaiwerk op alsof er niets gebeurd is.
  - Madeleine: "Dank je, lieverd." *(ze wrijft langzaam haar eigen handen, bijna tevreden)* "Vroeger had ik het ook zo koud, weet je. Het is fijn om iets te kunnen delen. Zonde om alles voor jezelf te houden." *(naait door)*
- Buiten, zonder gevolg (Heer Donatuslaan al open of schaduw al aanwezig):
  > Je staat weer buiten. De avondlucht is koel op je gezicht.
  - Kelly: "Wat een raar mens." *(wrijft over haar hand)* "Mijn hand is koud. Maar verder... niets. Gelukkig."
- Buiten, met gevolg:
  > Je staat weer buiten. De avondlucht is koel op je gezicht. Alles lijkt normaal.
  - Kelly: "Wat een raar mens." *(wrijft over haar hand)* "Mijn hand is nog steeds ijskoud."
  - Lade "Maar plots...":
    > Je schaduw beweegt. Net een tel na op je. Alsof hij niet wist welke kant hij op moest.
    > Je hand tintelt. Iets donkers kruipt door je vingers omhoog.
  - Na het hand-ritueel, lade "Wat was dat?":
    > "Wat was dat?" Kelly kijkt naar haar handen. De schim is weg, de tinteling ebt weg. "Het is weg. Maar het voelde... kwaad. Alsof iets me wilde vasthouden."
    > *(huivert)* "Was dat een voorbode? Het voelde als een vloek."

**Kelly weigert haar hand**
- Madeleine: "Och, jammer." *(glimlacht, trekt langzaam terug)* "Ik bedoelde het lief. Een ander keertje misschien."
> Ze pakt haar naaiwerk weer op. Maar haar ogen volgen Kelly tot ze buiten staat.

**Kelly na het hand-incident (komt nooit meer binnen)**
> Kelly nadert de winkel. Haar voeten stoppen vanzelf. Door het raam ziet ze Madeleine bij haar naaiwerk zitten, en heel even kijkt die op, recht naar haar, en glimlacht.
> Ze denkt terug aan die hand om de hare. Aan de kou die daarna niet meer wegtrok. Het voelde duister. Niet goed. Bijna vervloekt, al weet ze niet waarom juist dat woord bij haar opkomt.

- Kelly: *(draait om)* "Nee. Nooit meer."

**Kelly met de echte schaduw-vloek (hand-moment vervalt)**
> Een kledingwinkel. Naald en Masker. Door het raam zie je stoffen en naaiwerk. Er is hier niets meer voor je.

### Jan

**Eerste bezoek**
- Madeleine: *(kijkt op, bekijkt hem traag van schoenen tot kruin, glimlacht zonder warmte)* "Lang. Heel lang. Dat valt op in een straat, hè." *(zet de naald in de stof)* "Vooral 's nachts. De daken, de lantaarns... en dan jij." *(kijkt hem recht aan)* "Ik onthoud lange mannen."
- Jan: *(ongemakkelijk)* "...ik kom hier voor het eerst, hoor."
- Madeleine: "Dat weet ik."

**Latere bezoeken**
- Madeleine: *(kijkt op. Glimlacht. Zegt niets. Naait door. Haar ogen blijven op hem rusten.)*

**Jan met de munten van Felix (Heer Donatuslaan-keten)**
- [Knop: 👘 Koop vermomming voor Felix] Daarna lade "Vermomming gekocht":
  > Madeleine pakt zonder zoeken een outfit van de plank en schuift hem over de toonbank. Nu terug naar Felix, en de vermomming door het gat.

### Fenna-Viviènne

**Eerste bezoek**
- Madeleine: *(legt naaiwerk neer, glimlacht breed, loopt om de toonbank heen, te dichtbij)* "Ah. De zangeres." "Weet je, ik heb je laatste lied gehoord. Heel mooi. Heel... verdrietig."
- Fenna-Viviènne: *(fronst)* "Ik heb geen verdrietig liedje uitgebracht."
- Madeleine: "Nee?" *(hoofd schuin, glimlach blijft)* "Nog niet dan."
- Verteller: Ze keert terug naar haar stoel. Achter haar beweegt een paspop een fractie. Of beeldde Fenna zich dat in?

**Latere bezoeken**
- Madeleine: *(kijkt niet eens op)* "Dag, zangeres." *(naait door)* "Heb je dat liedje al geschreven?"

### Felix

**Zonder outfit (en zonder munten wordt hij weggestuurd)**
- Verteller: Madeleine kijkt je van top tot teen aan.
- Madeleine: "En wat denk jij hier zonder een cent op zak te halen? Ik ben geen liefdadigheidsinstelling." *(bot, koud)* "Eerst geld. Dan praten. Wegwezen."

**Met minstens één outfit, niet vermomd**
- Verteller: Madeleine kijkt je van top tot teen aan.
- Madeleine: *(kijkt je aan zonder te knipperen)* "Ik heb je door hoor." *(korte stilte)* "Maar maak je geen zorgen. Iedereen heeft iets te verbergen. Zelfs ik."

**Vermomd**
- Verteller: Madeleine kijkt je van top tot teen aan.
- Verteller: ✓ Je bent vermomd als [vermomming].

**Koop-flow**
- [Knop: 💰 Lucinde-outfit kopen] (met Munten van Stoop) Lade "Outfit verkregen":
  > Vanaf nu kun je je verkleden als Mevr. Lucinde — een oude kletstante. Maar om niet betrapt te worden is het omkleden in het pashokje van deze winkel wellicht verstandig...
- [Knop: 💰 Lola-outfit kopen] (met Munten van de Bewoner) Lade "Outfit verkregen":
  > Vanaf nu kun je je ook verkleden als Lola — een vurige Latin danseres. Trek hem aan in het pashokje wanneer je hem nodig hebt.
- [Knop: 👗 Vermommen] Lade "Wie wil je zijn?": "Kies een vermomming om aan te trekken." met per bezit een knop (👵 Word Mevr. Lucinde / 💃 Word Lola / 🐉 Word Liu-Yen)
- [Knop: Vermomming uittrekken]

### Rouwstof-quest (iedereen behalve Kelly)

- Verteller: Achterin de winkel, op een aparte plank, liggen donkere lappen stof. Ouder dan de rest. Rouwstof, precies zoals de apotheker zei.
- [Knop: 🖤 Vraag naar de rouwstof] Daarna lade "Rouwstof":
  > Madeleine knipt zonder vragen een klein lapje af van een donkere jurk. Fluweel, versleten aan de randen.
  - Madeleine: "Van een weduwejurk. Oud verdriet knipt makkelijk." *(geeft het lapje af alsof het niets is)*
  > Breng dit naar de apotheker in Heer Donatuslaan.

---

## Opmerkingen bij de herevaluatie

1. De locatiesK1-data-array (rond regel 4650) bevat nog oude versies van veel
   van deze teksten, onder andere een lange Madeleine-koopmonoloog
   (npcMetGeld) en oudere Wallingen- en Fenna-teksten. Die velden worden door
   de huidige renderfuncties nergens meer gelezen en verschillen inhoudelijk
   van wat spelers zien. Bij herschrijven dus alleen de renderfuncties
   aanpassen, of de dode data eerst opruimen (dat laatste is een aparte,
   bevestigingsplichtige wijziging).
2. Twee spelersteksten bevatten nog een em-dash, tegen de werkafspraak in:
   de lades van koopLucindeOutfit (regel 13176) en koopLolaOutfit (regel
   13188). Hierboven letterlijk geciteerd.
3. Onaf materiaal in deze scenes: "[Placefiller: hint Heer Donatuslaan 3]"
   in de toren-observaties en de twee "[Filler: ...]"-teksten in de
   kraal-flow bij Mevr. van Wallingen.
4. De heks-gok (wie is de heks van het Kraaienkwartier) speelt op het podium
   op het Dorpsplein en staat daarom niet in dit overzicht; de finale bij
   Nummer 7 (gate, overleg, Ava, filmpje) wel.

---

## Stappenplan per speler

Het Kraaienkwartier is klaar zodra het team vier eindsleutels heeft verzameld:
het dagboek leesbaar (Kelly), Sleutel Wallingen (Felix), Robbie staat klaar
(Fenna) en de kromme speld (Jan). Elke speler heeft zijn eigen keten, maar de
spelers hebben elkaar op twee plekken nodig (de put en de finale).

### Jan (slotenmaker)

1. Ga naar de Uitkijktoren (K3). De deur zit op slot; naast de drempel ligt een kromme speld. Pak hem op en open het slot met de lockpick-minigame. Je houdt de Kromme Speld: dit is de eindsleutel "Jan kan sommige deuren kraken".
2. Klim de toren op voor het uitzicht. Boven krijg je observaties (hints over het archief, het podium en, na de hint van de Verborgen Hand, de kraaientelling).
3. Ga naar de Dorpsput (K5) zodra Kelly erin is gevallen: je hoort haar om hulp roepen. Klik "Help Kelly uit de put"; de code verschijnt op jouw scherm. Roep hem hardop naar Kelly, zodat zij hem op haar tablet kan invullen.

### Kelly (onderzoeker)

1. Ga naar de Dorpsput (K5) en loop dichterbij. Je valt erin en vindt op de bodem het Nat Dagboek. Pak het op.
2. Je zit vast en komt er niet alleen uit: roep je team. Jan geeft je de code door; vul die in om eruit te komen.
3. Draag het Nat Dagboek naar het Dorpsarchief (Dorpsplein). De archivaris restaureert het. Dit levert de eindsleutel "Het dagboek leesbaar" op.
4. Bekijk in het archief het dagboek-filmpje. Dat is de voorwaarde die de heks-gok op het podium vrijgeeft. Vertel je team dat het dagboek nu voor iedereen leesbaar is.
5. Let op bij Naald en Masker (K8): Madeleine's hand-moment leidt tot de schaduw-voorbode. Voor de voortgang van het Kraaienkwartier hoef je daar niet naar binnen.

### Fenna-Viviènne (zangeres)

1. Ga naar Nummer 5 (K7) en klop aan bij Robbie. Hij wil dolgraag dat je voor hem zingt, maar zonder microfoon lukt dat niet.
2. Ga naar het Dorpsplein, achter het podium, en pak daar de microfoon op.
3. Ga terug naar Robbie en zing het lied (lied-doolhof). Bij succes krijg je de eindsleutel "Robbie staat klaar": hij belooft de groep te helpen.

### Felix / De Vos (spion)

1. Ga naar de Dorpsput (K5). Daar staat Tobbe, de weggelopen knecht. Neem hem mee.
2. Breng Tobbe terug naar Stoop de Groenteboer (K2) en neem de beloning aan: de Munten van Stoop.
3. Ga naar Naald en Masker (K8) en koop met die munten de Lucinde-outfit bij Madeleine.
4. Verkleed je (bij voorkeur in het pashokje van de winkel) als Mevr. Lucinde.
5. Ga als Lucinde naar De Nachtenwens (K4), naar Mevr. van Wallingen. Ontvang haar informatie: dit levert de eindsleutel "Sleutel Wallingen" op, die het hele team krijgt.

### Samen: de finale

Zodra de vier eindsleutels binnen zijn en ten minste één speler het
dagboek-filmpje in het archief heeft bekeken:

1. Ga naar het podium op het Dorpsplein. Eén speler claimt het stemrecht en wijst de heks aan. Het juiste antwoord is de Man van Nummer 7.
2. Ga met z'n vieren naar Nummer 7 (K6) en wacht tot alle vier aanwezig zijn (de aanwezigheids-gate).
3. Doorloop het overleg (het plan van Wallingen), waarna Fenna Robbie ophaalt als afleiding, jullie achterom naar Ava sluipen en het filmpje bekijken.
4. Na het filmpje wijst Ava richting Dorendael. Dorendael wordt ontgrendeld op de kaart.
