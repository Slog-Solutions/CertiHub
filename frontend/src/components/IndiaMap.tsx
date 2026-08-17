import React, { useState } from "react";
// @ts-ignore
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const indiaGeo = "/data/india-composite.geojson";
const statesGeo = "/data/Admin2.geojson";

type Place = { name: string; coordinates: [number, number] };

const places: Place[] = [
  { name: "Leh", coordinates: [77.5772, 34.1526] },
  { name: "Jammu", coordinates: [74.857, 32.7266] },
  { name: "Kangra", coordinates: [76.2731, 32.1015] },
  { name: "Delhi", coordinates: [77.1025, 28.7041] },
  { name: "Dehradun", coordinates: [78.0322, 30.3165] },
  { name: "Rishikesh", coordinates: [78.2853, 30.1158] },
  { name: "Ralwala", coordinates: [78.2147, 30.0222] },
  { name: "Lansdowne", coordinates: [78.6871, 29.8377] },
  { name: "Ranikhet", coordinates: [79.4322, 29.6434] },
  { name: "Dwarahat", coordinates: [79.4268, 29.776] },
  { name: "Chandigarh", coordinates: [76.7794, 30.7333] },
  { name: "Meerut", coordinates: [77.7064, 28.9845] },
  { name: "Lucknow", coordinates: [80.9462, 26.8467] },
  { name: "Assam (Guwahati)", coordinates: [92.9376, 26.2006] },
  { name: "Sri Ganganagar", coordinates: [73.88, 29.9094] },
  { name: "Amritsar", coordinates: [74.8723, 31.634] },
  { name: "Sagar", coordinates: [78.7378, 23.8388] },
  { name: "Bhopal", coordinates: [77.4126, 23.2599] },
  { name: "Jabalpur", coordinates: [79.9339, 23.1686] },
  { name: "Pune", coordinates: [73.8786, 18.5246] },
  { name: "Thane", coordinates: [72.9772, 19.2123] },
  { name: "Mumbai", coordinates: [72.8321, 18.9582] },
  { name: "Aurangabad", coordinates: [75.3393, 19.8758] },
  { name: "Faridkot", coordinates: [74.7539, 30.6774] },
  { name: "Visakhapatnam", coordinates: [83.2185, 17.6868] },
  { name: "Goa", coordinates: [74.124, 15.2993] },
  { name: "Hyderabad", coordinates: [78.4772, 17.4065] },
  { name: "Bangalore", coordinates: [77.5775, 12.9629] },
  { name: "Kochi", coordinates: [76.2673, 9.9312] },
  { name: "Andaman and Nicobar", coordinates: [92.5000, 10.7449] }
];

const ieiCenters = [
  {
    state: "Andhra Pradesh",
    centers: ["Vijayawada", "Visakhapatnam", "Anantapur", "Rajahmundry", "Tirupati"],
  },
  {
    state: "Assam",
    centers: ["Guwahati", "Dibrugarh", "Jorhat", "Silchar"],
  },
  { state: "Bihar", centers: ["Patna", "Muzaffarpur", "Bhagalpur"] },
  { state: "Chhattisgarh", centers: ["Raipur"] },
  { state: "Delhi", centers: ["New Delhi"] },
  { state: "Goa", centers: ["Panaji"] },
  {
    state: "Gujarat",
    centers: ["Ahmedabad", "Vadodara", "Surat", "Rajkot", "Bhavnagar", "Jamnagar", "Mehsana"],
  },
  { state: "Haryana", centers: ["Chandigarh", "Faridabad", "Rohtak", "Kurukshetra"] },
  { state: "Himachal Pradesh", centers: ["Shimla"] },
  { state: "Jharkhand", centers: ["Ranchi", "Dhanbad"] },
  { state: "Jammu & Kashmir", centers: ["Jammu", "Srinagar"] },
  { state: "Karnataka", centers: ["Bangalore", "Mysore", "Mangalore", "Hubli"] },
  { state: "Kerala", centers: ["Trivandrum", "Kochi", "Kozhikode", "Palakkad", "Thrissur"] },
  { state: "Madhya Pradesh", centers: ["Bhopal", "Indore", "Jabalpur", "Gwalior"] },
  { state: "Maharashtra", centers: ["Mumbai", "Pune", "Nagpur", "Aurangabad", "Amravati", "Kolhapur"] },
  { state: "Manipur", centers: ["Imphal"] },
  { state: "Meghalaya", centers: ["Shillong"] },
  { state: "Mizoram", centers: ["Aizawl"] },
  { state: "Nagaland", centers: ["Kohima"] },
  { state: "Odisha", centers: ["Bhubaneswar", "Rourkela", "Cuttack", "Sambalpur"] },
  { state: "Punjab", centers: ["Chandigarh", "Ludhiana", "Jalandhar", "Bathinda"] },
  { state: "Rajasthan", centers: ["Jaipur", "Udaipur", "Kota", "Jodhpur", "Bikaner", "Alwar"] },
  { state: "Sikkim", centers: ["Gangtok"] },
  { state: "Tamil Nadu", centers: ["Chennai", "Madurai", "Coimbatore", "Tirunelveli", "Erode", "Salem"] },
  { state: "Telangana", centers: ["Hyderabad", "Warangal"] },
  { state: "Tripura", centers: ["Agartala"] },
  { state: "Uttar Pradesh", centers: ["Lucknow", "Kanpur", "Varanasi", "Allahabad", "Ghaziabad", "Aligarh"] },
  { state: "Uttarakhand", centers: ["Dehradun", "Roorkee", "Pantnagar"] },
  { state: "West Bengal", centers: ["Kolkata", "Asansol", "Durgapur", "Jalpaiguri", "Kharagpur", "Siliguri"] },
  { state: "Overseas", centers: ["Doha", "Kuwait", "United Arab Emirates", "Oman"] },
];

// Dummy coordinates map for cities
const cityCoordinates: Record<string, [number, number]> = {
  Vijayawada: [80.64, 16.51],
  Visakhapatnam: [83.22, 17.68],
  Anantapur: [77.6, 14.68],
  Rajahmundry: [81.78, 17.0],
  Tirupati: [79.42, 13.63],
  Guwahati: [91.73, 26.14],
  Dibrugarh: [94.91, 27.48],
  Jorhat: [94.21, 26.75],
  Silchar: [92.79, 24.82],
  Patna: [85.14, 25.61],
  Muzaffarpur: [85.39, 26.12],
  Bhagalpur: [86.98, 25.25],
  Raipur: [81.63, 21.25],
  "New Delhi": [77.21, 28.61],
  Panaji: [73.83, 15.49],
  Ahmedabad: [72.57, 23.03],
  Vadodara: [73.18, 22.31],
  Surat: [72.83, 21.17],
  Rajkot: [70.8, 22.3],
  Bhavnagar: [72.15, 21.76],
  Jamnagar: [70.07, 22.47],
  Mehsana: [72.37, 23.6],
  Chandigarh: [76.7794, 30.7333],
  Faridabad: [77.31, 28.41],
  Rohtak: [76.57, 28.9],
  Kurukshetra: [76.82, 29.97],
  Shimla: [77.17, 31.1],
  Ranchi: [85.33, 23.36],
  Dhanbad: [86.44, 23.79],
  Jammu: [74.8570, 32.7266],
  Srinagar: [74.79, 34.08],
  Bangalore: [77.5775, 12.9629],
  Mysore: [76.65, 12.3],
  Mangalore: [74.86, 12.91],
  Hubli: [75.12, 15.36],
  Trivandrum: [76.95, 8.52],
  Kozhikode: [75.78, 11.26],
  Palakkad: [76.65, 10.77],
  Thrissur: [76.21, 10.52],
  Bhopal: [77.4126, 23.2599],
  Indore: [75.86, 22.72],
  Gwalior: [78.17, 26.22],
  Mumbai: [72.832118, 18.9582],
  Pune: [73.8786, 18.5246],
  Nagpur: [79.08, 21.15],
  Amravati: [77.75, 20.93],
  Kolhapur: [74.23, 16.7],
  Imphal: [93.94, 24.82],
  Shillong: [91.88, 25.57],
  Aizawl: [92.72, 23.73],
  Kohima: [94.11, 25.67],
  Bhubaneswar: [85.83, 20.27],
  Rourkela: [84.85, 22.23],
  Cuttack: [85.88, 20.46],
  Sambalpur: [83.97, 21.47],
  Ludhiana: [75.87, 30.9],
  Jalandhar: [75.57, 31.33],
  Bathinda: [74.95, 30.21],
  Jaipur: [75.79, 26.92],
  Udaipur: [73.68, 24.58],
  Kota: [75.83, 25.18],
  Jodhpur: [73.02, 26.29],
  Bikaner: [73.32, 28.02],
  Alwar: [76.6, 27.56],
  Gangtok: [88.62, 27.33],
  Chennai: [80.27, 13.08],
  Madurai: [78.12, 9.93],
  Coimbatore: [76.95, 11.02],
  Tirunelveli: [77.7, 8.73],
  Erode: [77.72, 11.34],
  Salem: [78.14, 11.65],
  Hyderabad: [78.4772, 17.4065],
  Warangal: [79.59, 17.97],
  Agartala: [91.29, 23.83],
  Kanpur: [80.35, 26.45],
  Lucknow: [80.9462, 26.8467],
  Varanasi: [82.97, 25.32],
  Allahabad: [81.85, 25.44],
  Ghaziabad: [77.45, 28.67],
  Aligarh: [78.08, 27.9],
  Dehradun: [78.0322, 30.3165],
  Roorkee: [77.89, 29.87],
  Pantnagar: [79.48, 29.0],
  Kolkata: [88.36, 22.57],
  Asansol: [86.98, 23.69],
  Durgapur: [87.29, 23.55],
  Jalpaiguri: [88.73, 26.52],
  Kharagpur: [87.32, 22.34],
  Siliguri: [88.42, 26.72],
  Doha: [51.53, 25.28],
  Kuwait: [47.97, 29.38],
  "United Arab Emirates": [55.3, 25.27],
  Oman: [58.59, 23.61],
};

const MapComponent: React.FC<{ places: Place[] }> = ({ places }) => {
  const [selected, setSelected] = useState<Place | null>(null);

  return (
    <div style={{ flex: 1, minWidth: 700, height: "auto" }}>
      <h3 className="text-2xl font-semibold text-center text-[#F5F5F5] mb-3">Our successfully delivered projects</h3>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 850, center: [82.8, 25] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={indiaGeo}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography key={geo.rsmKey} geography={geo} fill="#ffffff" stroke="#000" strokeWidth={1} />
            ))
          }
        </Geographies>
        <Geographies geography={statesGeo}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography key={geo.rsmKey} geography={geo} fill="none" stroke="#333" strokeWidth={0.6} />
            ))
          }
        </Geographies>

        {places.map((p, i) => (
          <Marker key={i} coordinates={p.coordinates} onMouseEnter={() => setSelected(p)}>
            <circle r={5} fill="#d62828" stroke="#900" strokeWidth={0.8} cursor="pointer" />
            {selected?.name === p.name && (
              <text
                textAnchor="middle"
                y={-10}
                style={{
                  fontFamily: "Arial",
                  fontSize: "15px",
                  fill: "#111",
                  fontWeight: "bold",
                  paintOrder: "stroke",
                  stroke: "#fff",
                  strokeWidth: 3,
                }}
              >
                {p.name}
              </text>
            )}

          </Marker>
        ))}
      </ComposableMap>

    </div>
  );
};

// Second map for IEI Centers
const IEIMap: React.FC = () => {
  const [expandedState, setExpandedState] = useState<string | null>(null);

  return (
    <div style={{ flex: 1, minWidth: 700, height: "auto" }}>
      <h3 className="text-2xl font-semibold text-center text-[#F5F5F5] mb-3">Our collaborative centers</h3>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 850, center: [82.8, 25] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={indiaGeo}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography key={geo.rsmKey} geography={geo} fill="#ffffff" stroke="#000" strokeWidth={1} />
            ))
          }
        </Geographies>
        <Geographies geography={statesGeo}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography key={geo.rsmKey} geography={geo} fill="none" stroke="#333" strokeWidth={0.6} />
            ))
          }
        </Geographies>

        {ieiCenters.map((stateObj, idx) => {
          const mainCenter = stateObj.centers[0];
          const coords = cityCoordinates[mainCenter];
          if (!coords) return null;

          return (
            <React.Fragment key={idx}>
              <Marker coordinates={coords} onClick={() => setExpandedState(expandedState === stateObj.state ? null : stateObj.state)}>
                <circle r={4} fill="#2a9d8f" stroke="#264653" strokeWidth={1} cursor="pointer" />

              </Marker>

              {expandedState === stateObj.state &&
                stateObj.centers.slice(1).map((city, i) => {
                  const cityCoords = cityCoordinates[city];
                  if (!cityCoords) return null;
                  return (
                    <Marker key={i} coordinates={cityCoords}>

                      <circle r={4} fill="#e76f51" stroke="#333" strokeWidth={0.8} />
                      <text textAnchor="middle" y={-8} style={{ fontFamily: "Arial", fontSize: "12px", fill: "#111" }}>
                        {city}
                      </text>
                    </Marker>
                  );
                })}
            </React.Fragment>
          );
        })}
      </ComposableMap>

    </div>
  );
};

const IndiaMap: React.FC = () => {
  return (
    <div style={{ display: "flex", gap: "40px", justifyContent: "center", alignItems: "flex-start" }}>
      {/* First Map */}
      <MapComponent places={places} />

      {/* Second Map (IEI Centers with click-expand) */}
      <IEIMap />
    </div>
  );
};

export default IndiaMap;
