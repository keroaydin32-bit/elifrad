import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const BoschCalculator = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="text-gray-500 hover:text-red-600"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Zurück
                        </Button>
                        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bosch Reichweitenrechner</h1>
                    </div>
                </div>
            </div>

            {/* Widget Container */}
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-1 bg-gray-900 flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-stripes">
                        OFFIZIELLES BOSCH EBIKE SYSTEM WIDGET
                    </div>
                    <iframe
                        src="https://ebike-reach-assistant.bosch-ebike.com/de/"
                        width="100%"
                        height="850"
                        title="Bosch Reichweitenrechner"
                        className="w-full h-[850px] border-none"
                        allow="geolocation"
                    ></iframe>
                    <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 mb-2">Wird das Tool nicht geladen? Bosch blockiert unter Umständen direkte Einbettungen auf einigen Systemen.</p>
                        <a
                            href="https://www.bosch-ebike.com/de/service/reichweiten-assistent/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 font-bold hover:underline text-xs"
                        >
                            Offiziellen Rechner in neuem Tab öffnen →
                        </a>
                    </div>
                </div>

                <div className="mt-12 max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight">Was beeinflusst die Reichweite?</h2>
                    <p className="text-gray-600 leading-relaxed font-medium">
                        Die Reichweite Ihres eBikes hängt von vielen Faktoren ab – von der gewählten Unterstützung über das Terrain bis hin zum Reifendruck.
                        Mit dem offiziellen Bosch Reichweiten-Assistenten können Sie Ihre individuelle Tour planen und die maximale Kilometerleistung Ihres Akkus simulieren.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BoschCalculator;
