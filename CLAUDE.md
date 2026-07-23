# CLAUDE.md

## Wat is dit project

"De Rozen van Zilverweide" is een Nederlandstalige, cooperatieve mysterie-ervaring
voor vier spelers, gebouwd onder de merknaam Calovia. Gespeeld op vier tablets
(landscape) op een fysieke locatie: bordjes langs een route, drie wijken plus een
dorpsplein (Dorpsplein, Kraaienkwartier K1-K8, Dorendael DD1-DD8, Heer Donatuslaan
H1-H8 plus Dorpsarchief).

De volledige plot staat in zilverweide.html en is spoilergevoelig. Behandel
scene-teksten als vertrouwelijk materiaal: vat de plot nergens samen in
documentatie, commits of pull requests.

## De vier rollen en hoe ze elkaar beinvloeden

- **Jan** ("Jij ziet wat anderen missen"): slotenmaker, lockpick-minigame.
- **Kelly** ("Jij ziet de patronen"): onderzoeker, doolhof-puzzels en archief.
- **Fenna-Vivienne** ("Jij krijgt de mooie momenten"): diva/zangeres, lied-doolhof.
- **Felix / De Vos** ("Jij verandert van masker"): spion met drie vermommingen:
  Liu-Yen (kinderlijk gebroken Nederlands, "ni" voor "niet"), Lola Ramirez
  (theatraal Nederlands plus een korte Spaanse interjectie per beat), Lucinde
  (formeel, keurig, licht veroordelend).

Felix wisselt van vermomming uitsluitend bij Naald en Masker (K8); daar haalt
Jan ook vermommingsoutfits op. H8 Steegje is Felix' omkleedplek in Heer
Donatuslaan.

Spelers zijn afhankelijk van elkaar: schaduwvloek-reddingen (de een moet de
ander vrijmaken met een code), de zes-staps unlockketen in Heer Donatuslaan,
en Felix' spiek-mechanic die met twee personen soepeler loopt dan solo.

## Werkafspraken (streng nageleefd)

- **Werk altijd via een branch en een pull request, nooit direct op main.**
  Tom keurt elke merge zelf goed.
- **De repo is de bron van waarheid.** Werk altijd vanaf de actuele checkout;
  bouw nooit op oude kopieen uit chats of documenten. zilverweide.html gaat
  boven elk ander document.
- **Nooit em-dashes, nergens.** Ook niet in code-commentaar of documentatie.
  Gebruik komma's, haakjes of herschrijf de zin.
- **Geen scrollen in gameplay, nooit.**
- `node --check` op de inline scripts voor elke oplevering, plus controle dat
  CSS-accolades in balans zijn en elke element-verwijzing bestaat.
- Complexe features en verhaal- of structuurwijzigingen: eerst je begrip
  teruggeven en bevestiging vragen. Mechanische fixes mogen direct.
- Spelerstekst in je-vorm als innerlijke monoloog, niet als vertelstem.
- Deurcodes en spelmechanieken staan nooit in scene-tekst, alleen in de UI na
  afloop van een scene.
- "God" is overal vervangen door "onze kerk". Tobbe heeft geen familie-
  referenties. NPC's stellen zich bij eerste ontmoeting kort voor.
- Personages weten niets van andermans acties tot die in-game gedeeld zijn.
- `[Placeholder: ...]` is de conventie voor onaf materiaal.
- Sommige media (filmpjes, locatie-afbeeldingen) staan bewust nog niet in de
  repo. Ontbrekende mediabestanden zijn geen bug. Verwijzingen ernaar nooit
  weghalen of "repareren".

## Gedeelde stand en Firebase

- **Dit is het gevoeligste deel van het spel.** Eerdere bugs: race condition
  op het intro-wachtscherm (opgelost met per-rol subkeys), flags die niet
  syncten (opgelost met de SHARED_VISITED_FLAGS-whitelist), en de sleutelteller
  in de Kraaienkwartier-finale die inventory telde in plaats van flags.
- De status van de Firebase-conversie is niet bevestigd: mogelijk draait een
  deel van de gedeelde stand nog via de SERVER-STUB in schaduw.js. Stel bij
  het eerste raakvlak met gedeelde stand eerst zelf vast wat er werkelijk
  draait en koppel dat aan Tom terug voordat je iets wijzigt.
- Claude Code kan synchronisatie niet zelf testen. Beschrijf bij elke
  wijziging aan gedeelde stand expliciet wat Tom op twee apparaten moet
  controleren voordat hij merget.
- Firebase-reset wist niet automatisch lokale browserstate; na reset moeten
  pagina's ververst worden.

## Bekende valkuilen in de code

- `state.locAfbeelding` lekte tussen schermen; district-openers moeten hem
  nullen. Let hierop bij nieuwe schermen.
- NPC-portretten: het `setTimeout(120)`-patroon in SPREKER_POPS is nodig omdat
  `showScreen()` `verbergNpcPop()` aanroept; same-src-check voorkomt respawn-
  animatie. Niet "opschonen".
- iOS Safari: de `--vh100`-variabele (100dvh via `@supports`) lost de
  adresbalk-scrollbug op. Nieuwe CSS moet die variabele gebruiken, geen
  kale 100vh.
- De terugknop mag Jan nooit uit de achterkamer van de slagerij laten
  ontsnappen.

## Wat goed werkt en met rust gelaten moet worden

De scene-engine, doolhof-engine, lockpick-engine, het schaduw-systeem, Fenna's
lied-doolhof en het debug/testpaneel (met correcte flagcombinaties per district)
draaien stabiel. Alleen aanraken als Tom er expliciet om vraagt, en dan minimaal
invasief. Het debug-paneel moet bij elke nieuwe feature een debugflag krijgen.

## Hoe Tom werkt

Sterk: hij test na elke oplevering en rapporteert exact wat er misgaat, vangt
typfouten, logicagaten en sfeerbreuken op die jij mist, en denkt kritisch mee
over voorstellen. Neem zijn correcties serieus, hij heeft meestal gelijk.
Aandachtspunten: hij communiceert kort en soms met tikfouten (vraag door bij
onduidelijkheid in plaats van te gokken), en wil complete teksten of bestanden,
geen geannoteerde fragmenten. Geef altijd een volgende stap, niet een lijst
van tien. Wees eerlijk over risico's en onzekerheden; zeg liever "dit weet ik
niet zeker, zal ik het checken" dan zelfverzekerd gokken.
