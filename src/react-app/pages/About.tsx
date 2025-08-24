import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Target, Info } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Tilbake til hovedsiden</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
            Om tjenesten
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Velkommen til Norges første plattform for kjøp, leie og utlån av stavhoppstaver.
          </p>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                Målet er enkelt: å få flere staver i bruk, slik at flere stavhoppere får muligheten til å utvikle seg og oppleve gleden ved sporten.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Staver er dyre, og en utøver i utvikling beveger seg raskt fra én stav til neste, enten på grunn av teknisk fremgang eller økt styrke og hurtighet. For klubber kan det bli svært kostbart å stadig kjøpe nye staver. Samtidig vet vi at det finnes hundrevis av "døde" staver rundt omkring – på klubbhus, i garasjer, i haller og på stadioner – som aldri blir brukt. Det er synd, for ingenting er så frustrerende for en stavhopper som å være "mellom to staver": den ene er for myk, den neste for stiv, og dermed stopper den sportslige utviklingen opp.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Denne plattformen er laget som en non-profit løsning, et verktøy for fellesskapet. Den koster ingenting å bruke og legger kun til rette for kontakt mellom eiere og de som ønsker staver.
              </p>
            </div>

            {/* How it works section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Info className="w-6 h-6 mr-2 text-blue-600" />
                Hvordan fungerer det?
              </h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-2">1. Legg inn dine staver</h3>
                  <p className="text-gray-700 mb-2">
                    Har du staver du bruker, staver du ikke lenger har behov for, eller et klubb-lager fullt av gamle staver? Registrer dem i databasen.
                  </p>
                  <p className="text-gray-700">For hver stav kan du merke om den:</p>
                  <ul className="list-disc list-inside mt-2 text-gray-700">
                    <li>er i bruk</li>
                    <li>kan leies ut</li>
                    <li>er til salgs</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-2">2. Søk etter staver</h3>
                  <p className="text-gray-700 mb-2">
                    Som utøver eller trener kan du søke etter eksakte modeller, lengder og stivheter.
                  </p>
                  <p className="text-gray-700">
                    Treffer du på en aktuell stav, kan du sende en forespørsel direkte til eieren.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-2">3. Avtal direkte</h3>
                  <p className="text-gray-700">
                    All videre kommunikasjon om lån, leie eller kjøp skjer direkte mellom stavens eier og den som ønsker staven. Plattformen legger bare til rette for at dere finner hverandre.
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-2">4. Informasjon og veiledning</h3>
                  <p className="text-gray-700 mb-2">Etter hvert vil vi bygge opp en kunnskapsbank med informasjon om:</p>
                  <ul className="list-disc list-inside mt-2 text-gray-700">
                    <li>valg av riktig stav</li>
                    <li>forskjeller mellom ulike modeller og merker</li>
                    <li>hvordan staver lages</li>
                    <li>forslag til fornuftige priser for leie</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Why is this important section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-6 h-6 mr-2 text-green-600" />
                Hvorfor er dette viktig?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Bedre ressursbruk</h3>
                  <p className="text-gray-700">
                    I stedet for at staver ligger ubrukt, kan de komme nye utøvere til gode.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Støtte til klubber og utøvere</h3>
                  <p className="text-gray-700">
                    Klubber slipper å bære hele kostnaden alene, og enkeltutøvere kan lettere få tak i riktig stav når de trenger det.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-600 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Flere og bedre stavhoppere i Norge</h3>
                  <p className="text-gray-700">
                    Tilgang til riktig utstyr er en forutsetning for å utvikle seg og lykkes i sporten.
                  </p>
                </div>
                
                <div className="border-l-4 border-pink-600 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Fellesskap og deling</h3>
                  <p className="text-gray-700">
                    Ved å hjelpe hverandre, bygger vi et sterkere stavhoppmiljø.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision section */}
            <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-center">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
                Vår visjon
              </h2>
              
              <div className="space-y-4 text-center">
                <p className="text-gray-700 font-medium">
                  Vi ønsker å skape en kultur der staver deles, gjenbrukes og utnyttes best mulig.
                </p>
                <p className="text-gray-700 font-medium">
                  Ingen utøver skal måtte stoppe utviklingen sin fordi riktig stav ikke er tilgjengelig.
                </p>
                <p className="text-lg text-gray-900 font-bold">
                  Sammen kan vi sørge for at flere får muligheten til å sette personlige rekorder, og at stavhopp som idrett vokser i Norge.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            to="/" 
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Start å utforske staver</span>
          </Link>
        </div>
      </div>
    </div>
  );
}