import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";


const AppContext = createContext();

//const API_BASE_URL = "http://localhost:3002/api/web";

export function AppProvider({ children }) {

    console.log("[AppProvider] Vừa vào hàm provider : AppProvider !");

    const [activeLocations, setActiveLocations] = useState([]);
    const [activeAccommodations, setActiveAccommodations] = useState([]);

    const [loadingDestinations, setLoadingDestinations] = useState(true);

    const [destinationsError, setDestinationsError] = useState("");

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    //console.log("[AppProvider] Value của biến apiBaseUrl (env VITE_API_BASE_URL) : " + apiBaseUrl);

    // useEffect() for test
    useEffect(() => {
        console.log("[AppProvider] đang chạy useEffect() của AppProvider !");
            
        // hàm cleanup
        return () => {
            console.log("[AppProvider] đang chạy hàm cleanup của useEffect() !");
        };
    });

    useEffect(() => {
        async function loadActiveLocationsAndAccommodations() {
            try {
                const response = await fetch(`${apiBaseUrl}/lookup/locations-and-accommodations`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include"
                });

                if (!response.ok) {
                    setDestinationsError("Không thể tải danh sách điểm đến và chỗ nghỉ.");
                    return;
                }

                const result = await response.json();

                setActiveLocations(result.data.locations);
                setActiveAccommodations(result.data.accommodations);
            } catch (error) {
                console.error("loadDestinations error:", error);
                setDestinationsError("Không thể tải danh sách điểm đến và chỗ nghỉ.");
            } finally {
                setLoadingDestinations(false);
            }
        }

        console.log("[AppProvider - useEffect] chuan bi chạy hàm loadActiveLocationsAndAccommodations() !");
        loadActiveLocationsAndAccommodations();
    }, []);

    console.log("[AppProvider] Data của activeLocations :");
    console.log(activeLocations);
    console.log("[AppProvider] Data của activeAccommodations :");
    console.log(activeAccommodations);


    return (
        <AppContext.Provider value={{
            activeLocations,
            activeAccommodations,
            loadingDestinations,
            destinationsError
        }}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContext;