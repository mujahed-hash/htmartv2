/**
 * Comprehensive India Locations Data
 * Contains major states and cities for HotelMart marketplace
 * Used for multi-location product posting and filtering
 */

const indiaLocations = {
    states: [
        {
            name: "Maharashtra",
            code: "MH",
            cities: [
                { name: "Mumbai", code: "mumbai" },
                { name: "Pune", code: "pune" },
                { name: "Nagpur", code: "nagpur" },
                { name: "Nashik", code: "nashik" },
                { name: "Aurangabad", code: "aurangabad" },
                { name: "Solapur", code: "solapur" },
                { name: "Thane", code: "thane" },
                { name: "Kolhapur", code: "kolhapur" },
                { name: "Navi Mumbai", code: "navi-mumbai" },
                { name: "Kalyan-Dombivli", code: "kalyan-dombivli" }
            ]
        },
        {
            name: "Delhi",
            code: "DL",
            cities: [
                { name: "New Delhi", code: "new-delhi" },
                { name: "Central Delhi", code: "central-delhi" },
                { name: "South Delhi", code: "south-delhi" },
                { name: "North Delhi", code: "north-delhi" },
                { name: "East Delhi", code: "east-delhi" },
                { name: "West Delhi", code: "west-delhi" },
                { name: "Delhi Cantonment", code: "delhi-cantonment" }
            ]
        },
        {
            name: "Karnataka",
            code: "KA",
            cities: [
                { name: "Bangalore", code: "bangalore" },
                { name: "Mysore", code: "mysore" },
                { name: "Mangalore", code: "mangalore" },
                { name: "Hubli", code: "hubli" },
                { name: "Belgaum", code: "belgaum" },
                { name: "Gulbarga", code: "gulbarga" },
                { name: "Bellary", code: "bellary" },
                { name: "Tumkur", code: "tumkur" }
            ]
        },
        {
            name: "Tamil Nadu",
            code: "TN",
            cities: [
                { name: "Chennai", code: "chennai" },
                { name: "Coimbatore", code: "coimbatore" },
                { name: "Madurai", code: "madurai" },
                { name: "Tiruchirappalli", code: "tiruchirappalli" },
                { name: "Salem", code: "salem" },
                { name: "Tirunelveli", code: "tirunelveli" },
                { name: "Erode", code: "erode" },
                { name: "Vellore", code: "vellore" },
                { name: "Thanjavur", code: "thanjavur" }
            ]
        },
        {
            name: "Gujarat",
            code: "GJ",
            cities: [
                { name: "Ahmedabad", code: "ahmedabad" },
                { name: "Surat", code: "surat" },
                { name: "Vadodara", code: "vadodara" },
                { name: "Rajkot", code: "rajkot" },
                { name: "Bhavnagar", code: "bhavnagar" },
                { name: "Jamnagar", code: "jamnagar" },
                { name: "Gandhinagar", code: "gandhinagar" },
                { name: "Junagadh", code: "junagadh" }
            ]
        },
        {
            name: "Rajasthan",
            code: "RJ",
            cities: [
                { name: "Jaipur", code: "jaipur" },
                { name: "Jodhpur", code: "jodhpur" },
                { name: "Udaipur", code: "udaipur" },
                { name: "Kota", code: "kota" },
                { name: "Ajmer", code: "ajmer" },
                { name: "Bikaner", code: "bikaner" },
                { name: "Alwar", code: "alwar" },
                { name: "Bharatpur", code: "bharatpur" }
            ]
        },
        {
            name: "Uttar Pradesh",
            code: "UP",
            cities: [
                { name: "Lucknow", code: "lucknow" },
                { name: "Kanpur", code: "kanpur" },
                { name: "Agra", code: "agra" },
                { name: "Varanasi", code: "varanasi" },
                { name: "Noida", code: "noida" },
                { name: "Ghaziabad", code: "ghaziabad" },
                { name: "Meerut", code: "meerut" },
                { name: "Allahabad", code: "allahabad" },
                { name: "Bareilly", code: "bareilly" },
                { name: "Aligarh", code: "aligarh" },
                { name: "Moradabad", code: "moradabad" },
                { name: "Saharanpur", code: "saharanpur" }
            ]
        },
        {
            name: "West Bengal",
            code: "WB",
            cities: [
                { name: "Kolkata", code: "kolkata" },
                { name: "Howrah", code: "howrah" },
                { name: "Durgapur", code: "durgapur" },
                { name: "Siliguri", code: "siliguri" },
                { name: "Asansol", code: "asansol" },
                { name: "Bardhaman", code: "bardhaman" },
                { name: "Malda", code: "malda" }
            ]
        },
        {
            name: "Telangana",
            code: "TG",
            cities: [
                { name: "Hyderabad", code: "hyderabad" },
                { name: "Warangal", code: "warangal" },
                { name: "Nizamabad", code: "nizamabad" },
                { name: "Karimnagar", code: "karimnagar" },
                { name: "Khammam", code: "khammam" }
            ]
        },
        {
            name: "Andhra Pradesh",
            code: "AP",
            cities: [
                { name: "Visakhapatnam", code: "visakhapatnam" },
                { name: "Vijayawada", code: "vijayawada" },
                { name: "Guntur", code: "guntur" },
                { name: "Tirupati", code: "tirupati" },
                { name: "Nellore", code: "nellore" },
                { name: "Kurnool", code: "kurnool" },
                { name: "Rajahmundry", code: "rajahmundry" }
            ]
        },
        {
            name: "Kerala",
            code: "KL",
            cities: [
                { name: "Thiruvananthapuram", code: "thiruvananthapuram" },
                { name: "Kochi", code: "kochi" },
                { name: "Kozhikode", code: "kozhikode" },
                { name: "Thrissur", code: "thrissur" },
                { name: "Kollam", code: "kollam" },
                { name: "Kannur", code: "kannur" },
                { name: "Palakkad", code: "palakkad" }
            ]
        },
        {
            name: "Madhya Pradesh",
            code: "MP",
            cities: [
                { name: "Indore", code: "indore" },
                { name: "Bhopal", code: "bhopal" },
                { name: "Jabalpur", code: "jabalpur" },
                { name: "Gwalior", code: "gwalior" },
                { name: "Ujjain", code: "ujjain" },
                { name: "Sagar", code: "sagar" },
                { name: "Ratlam", code: "ratlam" },
                { name: "Satna", code: "satna" }
            ]
        },
        {
            name: "Punjab",
            code: "PB",
            cities: [
                { name: "Chandigarh", code: "chandigarh" },
                { name: "Ludhiana", code: "ludhiana" },
                { name: "Amritsar", code: "amritsar" },
                { name: "Jalandhar", code: "jalandhar" },
                { name: "Patiala", code: "patiala" },
                { name: "Bathinda", code: "bathinda" },
                { name: "Mohali", code: "mohali" }
            ]
        },
        {
            name: "Haryana",
            code: "HR",
            cities: [
                { name: "Gurgaon", code: "gurgaon" },
                { name: "Faridabad", code: "faridabad" },
                { name: "Panipat", code: "panipat" },
                { name: "Ambala", code: "ambala" },
                { name: "Hisar", code: "hisar" },
                { name: "Karnal", code: "karnal" },
                { name: "Rohtak", code: "rohtak" }
            ]
        },
        {
            name: "Bihar",
            code: "BR",
            cities: [
                { name: "Patna", code: "patna" },
                { name: "Gaya", code: "gaya" },
                { name: "Bhagalpur", code: "bhagalpur" },
                { name: "Muzaffarpur", code: "muzaffarpur" },
                { name: "Purnia", code: "purnia" },
                { name: "Darbhanga", code: "darbhanga" },
                { name: "Bihar Sharif", code: "bihar-sharif" }
            ]
        },
        {
            name: "Jharkhand",
            code: "JH",
            cities: [
                { name: "Ranchi", code: "ranchi" },
                { name: "Jamshedpur", code: "jamshedpur" },
                { name: "Dhanbad", code: "dhanbad" },
                { name: "Bokaro", code: "bokaro" },
                { name: "Deoghar", code: "deoghar" },
                { name: "Hazaribagh", code: "hazaribagh" }
            ]
        },
        {
            name: "Odisha",
            code: "OD",
            cities: [
                { name: "Bhubaneswar", code: "bhubaneswar" },
                { name: "Cuttack", code: "cuttack" },
                { name: "Rourkela", code: "rourkela" },
                { name: "Brahmapur", code: "brahmapur" },
                { name: "Sambalpur", code: "sambalpur" },
                { name: "Puri", code: "puri" }
            ]
        },
        {
            name: "Assam",
            code: "AS",
            cities: [
                { name: "Guwahati", code: "guwahati" },
                { name: "Silchar", code: "silchar" },
                { name: "Dibrugarh", code: "dibrugarh" },
                { name: "Jorhat", code: "jorhat" },
                { name: "Tezpur", code: "tezpur" },
                { name: "Nagaon", code: "nagaon" }
            ]
        },
        {
            name: "Chhattisgarh",
            code: "CG",
            cities: [
                { name: "Raipur", code: "raipur" },
                { name: "Bhilai", code: "bhilai" },
                { name: "Bilaspur", code: "bilaspur" },
                { name: "Korba", code: "korba" },
                { name: "Durg", code: "durg" }
            ]
        },
        {
            name: "Uttarakhand",
            code: "UK",
            cities: [
                { name: "Dehradun", code: "dehradun" },
                { name: "Haridwar", code: "haridwar" },
                { name: "Roorkee", code: "roorkee" },
                { name: "Haldwani", code: "haldwani" },
                { name: "Rudrapur", code: "rudrapur" }
            ]
        },
        {
            name: "Goa",
            code: "GA",
            cities: [
                { name: "Panaji", code: "panaji" },
                { name: "Vasco da Gama", code: "vasco-da-gama" },
                { name: "Margao", code: "margao" },
                { name: "Mapusa", code: "mapusa" }
            ]
        },
        {
            name: "Himachal Pradesh",
            code: "HP",
            cities: [
                { name: "Shimla", code: "shimla" },
                { name: "Manali", code: "manali" },
                { name: "Dharamshala", code: "dharamshala" },
                { name: "Solan", code: "solan" },
                { name: "Kullu", code: "kullu" }
            ]
        },
        {
            name: "Jammu and Kashmir",
            code: "JK",
            cities: [
                { name: "Srinagar", code: "srinagar" },
                { name: "Jammu", code: "jammu" },
                { name: "Anantnag", code: "anantnag" },
                { name: "Udhampur", code: "udhampur" }
            ]
        }
    ]
};

// Helper functions
const getAllCities = () => {
    const cities = [];
    indiaLocations.states.forEach(state => {
        state.cities.forEach(city => {
            cities.push({
                ...city,
                state: state.name,
                stateCode: state.code
            });
        });
    });
    return cities;
};

const searchCities = (query) => {
    const lowerQuery = query.toLowerCase();
    return getAllCities().filter(city => 
        city.name.toLowerCase().includes(lowerQuery) ||
        city.state.toLowerCase().includes(lowerQuery)
    );
};

const getCitiesByState = (stateCode) => {
    const state = indiaLocations.states.find(s => s.code === stateCode);
    return state ? state.cities : [];
};

module.exports = {
    indiaLocations,
    getAllCities,
    searchCities,
    getCitiesByState
};

