  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl || DEFAULT_GAME_STYLE,
      center: [-81.7, 27.9], // you can tweak this if needed
      zoom: 7.5,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    map.current = mapInstance;

    // Navigation controls (zoom + rotate) in top-right
    mapInstance.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    // Cleanup on unmount
    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, [styleUrl]);

  // Get user location
  useEffect(() => {
    if (!map.current) return;

    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        setUserLocation(coords);
        map.current!.setCenter(coords);
        map.current!.setZoom(12);
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true },
    );
  }, []);
