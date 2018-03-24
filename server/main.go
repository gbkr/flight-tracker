package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
	"github.com/mitchellh/mapstructure"
)

const aircraftListURL = "http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json" 
const updateInterval = 10

type Message struct {
	Name string      `json:"name"`
	Data interface{} `json:"data"`
}

type Channel struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type Bounds struct {
	High float64 `json:"high"`
	Low  float64 `json:"low"`
}

type MapBounds struct {
	Lat Bounds `json:"lat"`
	Lng Bounds `json:"lng"`
}

type ClientUpdate struct {
	Bounds         MapBounds `json:"bounds"`
	ActiveFlightId string    `json:"activeFlightId"`
}

type AircraftMin struct {
	Id      int     `json:"Id"`
	Lat     float64 `json:"Lat"`
	Long    float64 `json:"Long"`
	Trak    float32 `json:"Trak"`
	Species int     `json:"Species"`
	EngType int     `json:"EngType"`
	Mil     bool    `json:"Mil"`
}

type AircraftMax struct {
	AircraftMin
	Reg        string  `json:"Reg"`
	Mdl        string  `json:"Mdl"`
	From       string  `json:"From"`
	To         string  `json:"To"`
	Icao       string  `json:"Icao"`
	Alt        float64 `json:"Alt"`
	GAlt       float64 `json:"GAlt"`
	Spd        float64 `json:"Spd"`
	Type       string  `json:"Type"`
	Man        string  `json:"Man"`
	Year       string  `json:"Year"`
	CNum       string  `json:"CNum"`
	Op         string  `json:"Op"`
	OpIcao     string  `json:"opIcao"`
	Sqk        string  `json:"Sqk"`
	Vsi        int     `json:"Vsi"`
	WTC        int     `json:"WTC"`
	Engines    string  `json:"Engines"`
	Cou        string  `json:"Cou"`
	Gnd        bool    `json:"Gnd"`
	Call       string  `json:"Call"`
	Interested bool    `json:"Interested"`
	Help       bool    `json:"Help"`
	Trt        int     `json:"Trt"`
}

type AircraftArray struct {
	Collection []AircraftMin `json:"array"`
}

type virtualRadar struct {
	ShtTrlSec float64       `json:"shtTrlSec"`
	Stm       float64       `json:"stm"`
	SrcFeed   float64       `json:"srcFeed"`
	ShowSil   bool          `json:"showSil"`
	ShowFlg   bool          `json:"showFlg"`
	FlgW      float64       `json:"flgW"`
	AcList    []AircraftMax `json:"acList"`
	LastDv    string        `json:"lastDv"`
	Src       float64       `json:"src"`
	Feeds     []interface{} `json:"feeds"`
	ShowPic   bool          `json:"showPic"`
	FlgH      float64       `json:"flgH"`
	TotalAc   float64       `json:"totalAc"`
}

// switch protocol from http -> websockets
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow connections from any origin
	CheckOrigin: func(r *http.Request) bool { return true },
}

var LatestFlightData []AircraftMax

func main() {

	fdata := make(chan []AircraftMax)
	go func() {
		for {
			fdata <- fetchFlightData()
			time.Sleep(time.Second * updateInterval)
		}
	}()

	go func() {
		for {
			flightResult := <-fdata
			LatestFlightData = flightResult
			time.Sleep(time.Second * 1)
		}
	}()

	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":4000", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	for {
		var inMessage Message
		if err := socket.ReadJSON(&inMessage); err != nil {
			fmt.Println(err)
			break
		}

		fmt.Printf("%#v\n", inMessage)
		switch inMessage.Name {
		case "bounds":
			go filterDataForBrowser(socket, inMessage.Data)

		case "activeFlightId":

			go fullDetailsForFlightId(socket, inMessage.Data)
		}
	}
}

func filterFlightData(data []AircraftMax) []AircraftMax {
	var filteredData = make([]AircraftMax, 0)
	for _, v := range data {
		if v.Gnd != true && v.From != "" && v.To != "" {
			filteredData = append(filteredData, v)
		}

	}
	return filteredData
}

func fetchFlightData() []AircraftMax {
	resp, err := http.Get(aircraftListURL )
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error fetching flight data: %v\n", err)
		os.Exit(1)
	}
	body, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading flight data: %v\n", err)
		os.Exit(1)
	}

	var vr virtualRadar

	err2 := json.Unmarshal(body, &vr)
	if err2 != nil {
		fmt.Println(err2)
	}

	result := filterFlightData(vr.AcList)
	return result
}

func fullDetailsForFlightId(socket *websocket.Conn, data interface{}) {
	flightId := data.(string)
	aircraft := fullDetailsForFlight(flightId)
	var x []AircraftMax
	x = append(x, aircraft)

	sendFlightDetails(socket, x)
}

func filterDataForBrowser(socket *websocket.Conn, data interface{}) {
	var clientUpdate ClientUpdate
	mapstructure.Decode(data, &clientUpdate)
	mapBounds := clientUpdate.Bounds
	activeFlightId := clientUpdate.ActiveFlightId

	if activeFlightId != "" {
		fullDetailsForFlightId(socket, activeFlightId)
	}

	latestMinFlightData := make([]AircraftMin, 0)

	for _, v := range LatestFlightData {
		latestMinFlightData = append(latestMinFlightData, v.AircraftMin)
	}

	visibleAircraft := filterOutOfBounds(latestMinFlightData, mapBounds)
	sendData(socket, visibleAircraft)
}

func describe(i interface{}) {
	fmt.Printf("(%v, %T)\n", i, i)
}

func filterOutOfBounds(allAircraft []AircraftMin, mapBounds MapBounds) []AircraftMin {
	var visiblePlanes = make([]AircraftMin, 0)
	for _, aircraft := range allAircraft {
		if aircraft.Lat >= mapBounds.Lat.Low &&
			aircraft.Lat <= mapBounds.Lat.High &&
			aircraft.Long >= mapBounds.Lng.Low &&
			aircraft.Long <= mapBounds.Lng.High {
			visiblePlanes = append(visiblePlanes, aircraft)
		}
	}

	return visiblePlanes
}

func fullDetailsForFlight(flightID string) AircraftMax {
	var target AircraftMax

	for _, e := range LatestFlightData {
		i, _ := strconv.Atoi(flightID)
		if e.Id == i {
			target = e
			break
		}
	}

	fmt.Println(target)
	return target
}

func sendFlightDetails(socket *websocket.Conn, data []AircraftMax) {
	json, err := json.Marshal(&data)
	if err != nil {
		fmt.Println(err)
	}
	message := Message{"aircraft detail", string(json)}
	socket.WriteJSON(message)
}

func sendData(socket *websocket.Conn, data []AircraftMin) {
	json, err := json.Marshal(&data)
	if err != nil {
		fmt.Println(err)
	}
	message := Message{"aircraft feed", string(json)}
	socket.WriteJSON(message)
}

func subscribeFeed(socket *websocket.Conn) {
	for {
		raw, err := ioutil.ReadFile("./data.json")
		if err != nil {
			fmt.Println(err.Error())
			os.Exit(1)
		}
		message := Message{"aircraft feed", string(raw)}
		socket.WriteJSON(message)
		time.Sleep(time.Second * 3)
	}
}
