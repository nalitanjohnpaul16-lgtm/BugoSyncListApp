import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Circle,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  X,
  Move,
  Info,
  Loader2,
  CheckCircle2,
  LocateFixed
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  BUGO_MAP_BOUNDS,
  BUGO_MAP_CENTER,
  HAZARD_CATEGORY_META,
  RISK_LEVEL_BADGES
} from '../../data/hazardDefaults';
import { BUGO_PUROKS } from '../../data/mockData';
import { BugoHazardZone, HazardCategory, HazardRiskLevel } from '../../types';

const CATEGORIES: HazardCategory[] = ['Flood', 'Landslide', 'Earthquake', 'Fire', 'Other'];
const RISK_LEVELS: HazardRiskLevel[] = ['Low', 'Moderate', 'High'];

interface HazardMarkerProps {
  zone: BugoHazardZone;
  displayPosition: { lat: number; lng: number };
  isSelected: boolean;
  isBeingMoved: boolean;
  canManage: boolean;
  onSelect: (zone: BugoHazardZone) => void;
  onDragPosition: (id: string, pos: { lat: number; lng: number }) => void;
  onDragFinish: (zone: BugoHazardZone, pos: { lat: number; lng: number }) => void;
  onStartMove: (zone: BugoHazardZone) => void;
  onEdit: (zone: BugoHazardZone) => void;
  onDelete: (id: string) => void;
  onCloseInfo: () => void;
}

const HazardMarkerWithInfo: React.FC<HazardMarkerProps> = ({
  zone,
  displayPosition,
  isSelected,
  isBeingMoved,
  canManage,
  onSelect,
  onDragPosition,
  onDragFinish,
  onStartMove,
  onEdit,
  onDelete,
  onCloseInfo
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const meta = HAZARD_CATEGORY_META[zone.disasterType] || HAZARD_CATEGORY_META.Other;

  return (
    <>
      <Circle
        center={displayPosition}
        radius={zone.radiusMeters || 180}
        strokeColor={meta.circleStroke}
        strokeOpacity={isBeingMoved ? 0.95 : 0.85}
        strokeWeight={isBeingMoved ? 2.5 : 1.5}
        fillColor={meta.circleFill}
        fillOpacity={zone.riskLevel === 'High' ? 0.28 : zone.riskLevel === 'Moderate' ? 0.2 : 0.14}
        clickable={false}
      />

      <AdvancedMarker
        ref={markerRef}
        position={displayPosition}
        draggable={canManage}
        title={
          canManage
            ? `${zone.name} (${zone.disasterType}) — Drag to move`
            : `${zone.name} (${zone.disasterType} - ${zone.riskLevel})`
        }
        onClick={() => onSelect(zone)}
        onDrag={
          canManage
            ? (e) => {
                if (e.latLng) {
                  onDragPosition(zone.id, {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  });
                }
              }
            : undefined
        }
        onDragEnd={
          canManage
            ? (e) => {
                if (e.latLng) {
                  onDragFinish(zone, {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  });
                }
              }
            : undefined
        }
      >
        <Pin
          background={meta.pinBg}
          borderColor={isBeingMoved ? '#111827' : meta.pinBorder}
          glyphColor="#ffffff"
          glyphText={meta.pinGlyph}
          scale={isSelected || isBeingMoved ? 1.3 : 1.1}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={270} onCloseClick={onCloseInfo}>
          <div className="p-1 space-y-2 text-xs text-gray-800">
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${meta.badgeClass}`}>
                {meta.label}
              </span>
              <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${RISK_LEVEL_BADGES[zone.riskLevel]}`}>
                {zone.riskLevel} Risk
              </span>
            </div>

            <div>
              <p className="font-extrabold text-gray-900 text-sm leading-snug">{zone.name}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {zone.purok.split(' - ')[0]} • {zone.radiusMeters}m area
              </p>
            </div>

            <p className="text-xs text-gray-700 leading-snug">{zone.description}</p>

            {canManage && (
              <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => onStartMove(zone)}
                  className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Move className="w-3 h-3" />
                  <span>Move</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(zone)}
                  className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(zone.id)}
                  className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapPanner: React.FC<{ selectedZone: BugoHazardZone | null }> = ({ selectedZone }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !selectedZone) return;
    map.panTo({ lat: selectedZone.lat, lng: selectedZone.lng });
  }, [map, selectedZone]);

  return null;
};

const MapStatusOverlay: React.FC = () => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.LOADED) return null;

  if (status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED) {
    return (
      <div className="absolute inset-0 z-10 bg-gray-50/95 flex flex-col items-center justify-center p-6 text-center space-y-2">
        <MapPin className="w-8 h-8 text-amber-600" />
        <p className="text-sm font-bold text-gray-800">Unable to load Google Maps</p>
        <p className="text-xs text-gray-500 max-w-sm">
          {status === APILoadingStatus.AUTH_FAILURE
            ? 'Google Maps rejected the API key or referrer configuration.'
            : 'Failed to load Google Maps JavaScript API. Check network connectivity and try again.'}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 bg-gray-50/80 flex flex-col items-center justify-center gap-2 pointer-events-none">
      <Loader2 className="w-6 h-6 text-[#0c532b] animate-spin" />
      <span className="text-xs font-semibold text-gray-600">Loading Barangay Bugo map...</span>
    </div>
  );
};

interface BugoHazardMapViewProps {
  canManage: boolean;
}

interface DetectedLocationInfo {
  areaName: string;
  formattedAddress: string;
  matchedZone: string;
  nearbyLandmark?: string;
  suggestedTitle: string;
}

export const BugoHazardMapView: React.FC<BugoHazardMapViewProps> = ({ canManage }) => {
  const {
    hazardZones,
    mapsApiKey,
    addHazardZone,
    updateHazardZone,
    deleteHazardZone
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'All' | HazardCategory>('All');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Simple Admin Pinning & Moving States
  const [pinModeCategory, setPinModeCategory] = useState<HazardCategory | null>(null);
  const [movingZoneId, setMovingZoneId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ id: string; lat: number; lng: number } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Automatic Area / Zone Detection States
  const [isLocatingArea, setIsLocatingArea] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocationInfo | null>(null);
  const nameManuallyEditedRef = useRef(false);
  const geoReqIdRef = useRef(0);

  // Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<BugoHazardZone | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '',
    disasterType: 'Flood' as HazardCategory,
    riskLevel: 'Moderate' as HazardRiskLevel,
    purok: BUGO_PUROKS[0],
    lat: BUGO_MAP_CENTER.lat,
    lng: BUGO_MAP_CENTER.lng,
    radiusMeters: 200,
    description: ''
  });

  useEffect(() => {
    if (!statusNotice) return;
    const t = setTimeout(() => setStatusNotice(null), 3200);
    return () => clearTimeout(t);
  }, [statusNotice]);

  const visibleZones = useMemo(() => {
    return hazardZones.filter(z => categoryFilter === 'All' || z.disasterType === categoryFilter);
  }, [hazardZones, categoryFilter]);

  const selectedZone = useMemo(
    () => visibleZones.find(z => z.id === selectedZoneId) || null,
    [visibleZones, selectedZoneId]
  );

  const movingZone = useMemo(
    () => hazardZones.find(z => z.id === movingZoneId) || null,
    [hazardZones, movingZoneId]
  );

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
  };

  const locateAreaForCoords = async (lat: number, lng: number): Promise<DetectedLocationInfo | null> => {
    try {
      const res = await fetch(`/api/maps/reverse-geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
      const data = await res.json().catch(() => null);
      if (res.status === 429 || data?.quotaExceeded) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        return null;
      }
      if (!res.ok || !data?.success) return null;
      return {
        areaName: data.areaName || '',
        formattedAddress: data.formattedAddress || '',
        matchedZone: data.matchedZone || BUGO_PUROKS[0],
        nearbyLandmark: data.nearbyLandmark || '',
        suggestedTitle: data.suggestedTitle || data.areaName || BUGO_PUROKS[0]
      };
    } catch {
      return null;
    }
  };

  const startPinMode = (cat: HazardCategory = 'Flood') => {
    setMovingZoneId(null);
    setSelectedZoneId(null);
    setPinModeCategory(cat);
  };

  const startMoveZone = (zone: BugoHazardZone) => {
    setPinModeCategory(null);
    setSelectedZoneId(null);
    setIsModalOpen(false);
    setMovingZoneId(zone.id);
  };

  const openAddModal = (coords?: { lat: number; lng: number }, legend?: HazardCategory) => {
    const targetLat = Number((coords?.lat ?? BUGO_MAP_CENTER.lat).toFixed(6));
    const targetLng = Number((coords?.lng ?? BUGO_MAP_CENTER.lng).toFixed(6));
    setEditingZone(null);
    setFormError('');
    nameManuallyEditedRef.current = false;
    setDetectedLocation(null);
    const chosenCategory = legend || pinModeCategory || (categoryFilter !== 'All' ? categoryFilter : 'Flood');
    setForm({
      name: '',
      disasterType: chosenCategory,
      riskLevel: 'Moderate',
      purok: BUGO_PUROKS[0],
      lat: targetLat,
      lng: targetLng,
      radiusMeters: 200,
      description: ''
    });
    setPinModeCategory(null);
    setMovingZoneId(null);
    setIsModalOpen(true);

    const reqId = ++geoReqIdRef.current;
    setIsLocatingArea(true);
    locateAreaForCoords(targetLat, targetLng).then((geo) => {
      if (geoReqIdRef.current !== reqId) return;
      setIsLocatingArea(false);
      if (!geo) return;
      setDetectedLocation(geo);
      setForm(prev => ({
        ...prev,
        purok: geo.matchedZone || prev.purok,
        name: nameManuallyEditedRef.current ? prev.name : geo.suggestedTitle
      }));
    });
  };

  const openEditModal = (z: BugoHazardZone) => {
    setEditingZone(z);
    setFormError('');
    nameManuallyEditedRef.current = false;
    setDetectedLocation(null);
    setForm({
      name: z.name,
      disasterType: z.disasterType,
      riskLevel: z.riskLevel,
      purok: z.purok,
      lat: z.lat,
      lng: z.lng,
      radiusMeters: z.radiusMeters || 200,
      description: z.description
    });
    setPinModeCategory(null);
    setMovingZoneId(null);
    setSelectedZoneId(null);
    setIsModalOpen(true);

    const reqId = ++geoReqIdRef.current;
    setIsLocatingArea(true);
    locateAreaForCoords(z.lat, z.lng).then((geo) => {
      if (geoReqIdRef.current !== reqId) return;
      setIsLocatingArea(false);
      if (geo) setDetectedLocation(geo);
    });
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Please enter a short place name.');
      return;
    }

    setSaving(true);
    setFormError('');
    const payload = {
      name: form.name.trim(),
      disasterType: form.disasterType,
      riskLevel: form.riskLevel,
      purok: form.purok,
      lat: form.lat,
      lng: form.lng,
      radiusMeters: Math.max(50, Math.min(2000, Number(form.radiusMeters) || 200)),
      description: form.description.trim() || `${form.disasterType}-prone area in ${form.purok.split(' - ')[0]}.`
    };

    const res = editingZone
      ? await updateHazardZone(editingZone.id, payload)
      : await addHazardZone(payload);

    setSaving(false);
    if (!res.success) {
      setFormError(res.message || 'Unable to save location.');
      return;
    }
    setIsModalOpen(false);
    if (res.zone) {
      setSelectedZoneId(res.zone.id);
      showNotice(editingZone ? `Updated "${res.zone.name}"` : `Pinned "${res.zone.name}"`);
    }
  };

  const handleMapClick = async (coords: { lat: number; lng: number }) => {
    if (!canManage) return;

    // 1. Moving an existing pin with 1 click + auto-locating new area & zone name
    if (movingZone) {
      const targetZone = movingZone;
      const lat = Number(coords.lat.toFixed(6));
      const lng = Number(coords.lng.toFixed(6));
      setMovingZoneId(null);
      showNotice(`Locating new area for "${targetZone.name}"...`);

      const geo = await locateAreaForCoords(lat, lng);
      const nextPurok = geo?.matchedZone || targetZone.purok;
      const nextName = geo?.suggestedTitle || targetZone.name;

      const res = await updateHazardZone(targetZone.id, {
        lat,
        lng,
        purok: nextPurok,
        name: nextName
      });
      if (res.success && res.zone) {
        setSelectedZoneId(res.zone.id);
        showNotice(`Moved to ${res.zone.name}`);
      }
      return;
    }

    // 2. Dropping a new pin for selected legend
    if (pinModeCategory) {
      openAddModal(coords, pinModeCategory);
    }
  };

  const handleMarkerDragFinish = async (zone: BugoHazardZone, pos: { lat: number; lng: number }) => {
    const lat = Number(pos.lat.toFixed(6));
    const lng = Number(pos.lng.toFixed(6));
    showNotice(`Locating new area for "${zone.name}"...`);

    const geo = await locateAreaForCoords(lat, lng);
    const nextPurok = geo?.matchedZone || zone.purok;
    const nextName = geo?.suggestedTitle || zone.name;

    const res = await updateHazardZone(zone.id, {
      lat,
      lng,
      purok: nextPurok,
      name: nextName
    });
    setDragPreview(null);
    if (res.success && res.zone) {
      setSelectedZoneId(res.zone.id);
      showNotice(`Moved to ${res.zone.name}`);
    }
  };

  const handleDeleteZone = async (id: string) => {
    const target = hazardZones.find(z => z.id === id);
    await deleteHazardZone(id);
    if (selectedZoneId === id) setSelectedZoneId(null);
    if (movingZoneId === id) setMovingZoneId(null);
    if (target) showNotice(`Removed "${target.name}"`);
  };

  const activeLegendMeta = pinModeCategory ? HAZARD_CATEGORY_META[pinModeCategory] : null;

  return (
    <div className="space-y-4">
      {/* Simple Readable Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Bugo Disaster Hazard Map
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {canManage
              ? 'Click a legend to pin a new spot, or drag any pin to move it.'
              : 'View flood, landslide, earthquake, and fire-prone areas in Barangay Bugo.'}
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            {pinModeCategory ? (
              <button
                type="button"
                onClick={() => setPinModeCategory(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel Pinning</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startPinMode(categoryFilter !== 'All' ? categoryFilter : 'Flood')}
                className="px-4 py-2 bg-[#0c532b] hover:bg-[#094222] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Pin New Hazard</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Simple Legend Bar (Filters + One-Click Pin Legend Picker for Admin) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
            {pinModeCategory ? 'Step 1: Choose Hazard Legend to Pin' : 'Hazard Legends'}
          </span>
          {statusNotice && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusNotice}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {!pinModeCategory && (
            <button
              type="button"
              onClick={() => setCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                categoryFilter === 'All'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              All ({hazardZones.length})
            </button>
          )}

          {CATEGORIES.map(cat => {
            const meta = HAZARD_CATEGORY_META[cat];
            const count = hazardZones.filter(z => z.disasterType === cat).length;
            const isActiveFilter = !pinModeCategory && categoryFilter === cat;
            const isActivePin = pinModeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  if (pinModeCategory) {
                    setPinModeCategory(cat);
                  } else {
                    setCategoryFilter(cat);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition cursor-pointer ${
                  isActivePin
                    ? 'bg-emerald-50 text-gray-900 border-[#0c532b] ring-2 ring-[#0c532b]/25'
                    : isActiveFilter
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className={`w-3 h-3 rounded-full shrink-0 ${meta.dotClass}`} />
                <span>{meta.label}</span>
                {!pinModeCategory && (
                  <span className={`text-[11px] ${isActiveFilter ? 'text-gray-300' : 'text-gray-500'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + Clean Readable Locations List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col">
          {/* Clear Action Banner when Pinning or Moving */}
          {canManage && (pinModeCategory || movingZone) && (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                {movingZone ? (
                  <>
                    <Move className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Moving <strong>{movingZone.name}</strong> — click the new spot on the map
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${activeLegendMeta?.dotClass}`} />
                    <span>
                      Step 2: Click anywhere on the map to pin a{' '}
                      <strong>{activeLegendMeta?.label}</strong> area
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPinModeCategory(null);
                  setMovingZoneId(null);
                }}
                className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold rounded-lg cursor-pointer shrink-0"
              >
                Cancel
              </button>
            </div>
          )}

          <div className={`w-full h-[460px] relative ${pinModeCategory || movingZone ? 'cursor-crosshair' : ''}`}>
            {mapsApiKey ? (
              <APIProvider apiKey={mapsApiKey} libraries={['marker']} language="en" region="PH">
                <MapStatusOverlay />
                <GoogleMap
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  defaultCenter={BUGO_MAP_CENTER}
                  defaultZoom={15}
                  minZoom={13}
                  maxZoom={18}
                  restriction={{
                    latLngBounds: BUGO_MAP_BOUNDS,
                    strictBounds: false
                  }}
                  gestureHandling="greedy"
                  mapTypeControl={true}
                  streetViewControl={false}
                  style={{ width: '100%', height: '100%' }}
                  onClick={(ev) => {
                    if (canManage && (pinModeCategory || movingZone) && ev.detail?.latLng) {
                      handleMapClick({
                        lat: ev.detail.latLng.lat,
                        lng: ev.detail.latLng.lng
                      });
                    }
                  }}
                >
                  <MapPanner selectedZone={selectedZone} />
                  {visibleZones.map(zone => {
                    const livePos =
                      dragPreview && dragPreview.id === zone.id
                        ? { lat: dragPreview.lat, lng: dragPreview.lng }
                        : { lat: zone.lat, lng: zone.lng };

                    return (
                      <HazardMarkerWithInfo
                        key={zone.id}
                        zone={zone}
                        displayPosition={livePos}
                        isSelected={selectedZone?.id === zone.id}
                        isBeingMoved={movingZoneId === zone.id}
                        canManage={canManage}
                        onSelect={(z) => setSelectedZoneId(z.id)}
                        onDragPosition={(id, pos) => setDragPreview({ id, ...pos })}
                        onDragFinish={handleMarkerDragFinish}
                        onStartMove={startMoveZone}
                        onEdit={openEditModal}
                        onDelete={handleDeleteZone}
                        onCloseInfo={() => setSelectedZoneId(null)}
                      />
                    );
                  })}
                </GoogleMap>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center space-y-2">
                <Loader2 className="w-7 h-7 text-[#0c532b] animate-spin" />
                <p className="text-sm font-bold text-gray-700">Loading Barangay Bugo map...</p>
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              {canManage
                ? 'Tip: Drag any pin directly on the map to adjust its position.'
                : 'For barangay planning & awareness only. For live emergencies, call 911.'}
            </span>
            <span className="font-semibold text-gray-500">Barangay Bugo, CDO</span>
          </div>
        </div>

        {/* Simple, Readable Pinned Areas List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col max-h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-extrabold text-gray-900">
              Pinned Areas ({visibleZones.length})
            </h2>
            {canManage && !pinModeCategory && (
              <button
                type="button"
                onClick={() => startPinMode(categoryFilter !== 'All' ? categoryFilter : 'Flood')}
                className="text-xs font-bold text-[#0c532b] hover:underline cursor-pointer"
              >
                + Add Pin
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 mt-1 pr-1">
            {visibleZones.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10">
                No hazard pins in this category yet.
              </p>
            ) : (
              visibleZones.map(z => {
                const meta = HAZARD_CATEGORY_META[z.disasterType] || HAZARD_CATEGORY_META.Other;
                const active = selectedZoneId === z.id || movingZoneId === z.id;
                return (
                  <div
                    key={z.id}
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`py-3 px-2.5 rounded-xl cursor-pointer transition space-y-1.5 ${
                      movingZoneId === z.id
                        ? 'bg-amber-50 border border-amber-200'
                        : active
                        ? 'bg-emerald-50/80'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${RISK_LEVEL_BADGES[z.riskLevel]}`}>
                        {z.riskLevel}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-gray-900 leading-snug">{z.name}</p>
                    <p className="text-xs text-gray-600">
                      {z.purok.split(' - ')[0]} • {z.radiusMeters}m area
                    </p>

                    {canManage && (
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startMoveZone(z);
                          }}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer flex items-center gap-1"
                        >
                          <Move className="w-3 h-3" />
                          <span>Move</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(z);
                          }}
                          className="text-xs font-bold text-gray-700 hover:text-gray-950 cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteZone(z.id);
                          }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Simple, Clean Pin Details Modal */}
      {isModalOpen && canManage && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-extrabold text-gray-900">
                {editingZone ? 'Edit Hazard Pin' : 'Save Hazard Pin'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveZone} className="space-y-4 text-xs">
              {/* Visual Legend Picker */}
              <div>
                <label className="block font-bold text-gray-800 mb-1.5">Hazard Legend</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => {
                    const meta = HAZARD_CATEGORY_META[cat];
                    const selected = form.disasterType === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm({ ...form, disasterType: cat })}
                        className={`px-2.5 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 transition cursor-pointer ${
                          selected
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${meta.dotClass}`} />
                        <span>{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-Located Specific Area & Zone */}
              <div className="px-3 py-2 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isLocatingArea ? (
                    <Loader2 className="w-4 h-4 text-[#0c532b] animate-spin shrink-0" />
                  ) : (
                    <LocateFixed className="w-4 h-4 text-[#0c532b] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-emerald-950 truncate">
                      {isLocatingArea
                        ? 'Locating specific area & zone...'
                        : detectedLocation
                        ? `Detected: ${detectedLocation.suggestedTitle}`
                        : 'Area ready'}
                    </p>
                    {detectedLocation && !isLocatingArea && (
                      <p className="text-[10px] text-emerald-800 truncate">
                        {detectedLocation.matchedZone}
                      </p>
                    )}
                  </div>
                </div>
                {editingZone && detectedLocation && !isLocatingArea && (
                  <button
                    type="button"
                    onClick={() => {
                      nameManuallyEditedRef.current = true;
                      setForm(prev => ({
                        ...prev,
                        name: detectedLocation.suggestedTitle,
                        purok: detectedLocation.matchedZone
                      }));
                    }}
                    className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 text-[#0c532b] text-[11px] font-bold rounded-lg shrink-0 cursor-pointer"
                  >
                    Use Detected
                  </button>
                )}
              </div>

              {/* Place Name */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">Place / Area Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    nameManuallyEditedRef.current = true;
                    setForm({ ...form, name: e.target.value });
                  }}
                  placeholder={isLocatingArea ? 'Detecting area name...' : 'e.g. Zone 2 Creek Overflow'}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0c532b]"
                />
              </div>

              {/* Risk Level + Purok */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1.5">Risk Level</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {RISK_LEVELS.map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setForm({ ...form, riskLevel: level })}
                        className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                          form.riskLevel === level
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1.5">Purok / Zone</label>
                  <select
                    value={form.purok}
                    onChange={(e) => setForm({ ...form, purok: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 font-semibold outline-none"
                  >
                    {BUGO_PUROKS.map(p => (
                      <option key={p} value={p}>{p.split(' - ')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Simple Radius Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-800">Affected Area Size</label>
                  <span className="font-extrabold text-[#0c532b]">{form.radiusMeters} meters</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={10}
                  value={Math.min(800, Math.max(50, form.radiusMeters))}
                  onChange={(e) => setForm({ ...form, radiusMeters: Number(e.target.value) })}
                  className="w-full accent-[#0c532b] cursor-pointer"
                />
              </div>

              {/* Short Note */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">Short Note (Optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief warning for residents..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#0c532b]"
                />
              </div>

              {/* Clean Spot Footer + Move on Map option when editing */}
              {editingZone && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[11px] text-gray-600">
                    Spot: {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => startMoveZone(editingZone)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Move className="w-3.5 h-3.5" />
                    <span>Move Pin on Map</span>
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#0c532b] hover:bg-[#094222] text-white font-bold rounded-xl cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Pin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
