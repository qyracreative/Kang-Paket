/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Truck, 
  User, 
  Cloud, 
  Film, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Camera, 
  Volume2, 
  MessageSquare,
  Sparkles,
  Package
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// --- Types ---

interface Character {
  name: string;
  type: string;
  visual: string;
  personality: string;
  traits: string;
  characteristic: string;
  vide: string;
  outfit: string;
  location?: string;
  vehicle?: string;
  package?: string;
  reaction?: string;
}

interface Environment {
  weather: string;
  atmosphere: string;
  tone: string;
}

interface Scene {
  sceneNumber: number;
  visualDescription: string;
  cameraMovement: string;
  sfx: string;
  dialogue: string;
}

interface GeneratedPrompt {
  title: string;
  scenes: Scene[];
}

// --- Constants ---

const DEFAULT_COURIER: Character = {
  name: "",
  type: "",
  visual: "",
  personality: "",
  traits: "",
  characteristic: "",
  vide: "",
  outfit: "",
  vehicle: "",
};

const DEFAULT_RECIPIENT: Character = {
  name: "",
  type: "",
  visual: "",
  personality: "",
  traits: "",
  characteristic: "",
  vide: "",
  outfit: "",
  location: "",
  package: "",
  reaction: "",
};

const DEFAULT_ENV: Environment = {
  weather: "",
  atmosphere: "",
  tone: "",
};

// --- App Component ---
const getParams = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    courier: {
      name: params.get("courier_name") || "",
      type: params.get("courier_type") || "",
      visual: params.get("courier_visual") || "",
      personality: params.get("courier_personality") || "",
      traits: params.get("courier_traits") || "",
      characteristic: params.get("courier_characteristic") || "",
      vide: params.get("courier_vide") || "",
      outfit: params.get("courier_outfit") || "",
      vehicle: params.get("courier_vehicle") || "",
    },
    recipient: {
      name: params.get("recipient_name") || "",
      type: params.get("recipient_type") || "",
      visual: params.get("recipient_visual") || "",
      personality: params.get("recipient_personality") || "",
      traits: params.get("recipient_traits") || "",
      characteristic: params.get("recipient_characteristic") || "",
      vide: params.get("recipient_vide") || "",
      outfit: params.get("recipient_outfit") || "",
      location: params.get("recipient_location") || "",
      package: params.get("recipient_package") || "",
      reaction: params.get("recipient_reaction") || "",
    },
    env: {
      weather: params.get("weather") || "",
      atmosphere: params.get("atmosphere") || "",
      tone: params.get("tone") || "",
    }
  };
};
export default function App() {
  const params = getParams();

const [courier, setCourier] = useState<Character>(params.courier);
const [recipient, setRecipient] = useState<Character>(params.recipient);
const [env, setEnv] = useState<Environment>(params.env);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSceneIdx, setCopiedSceneIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorHeader(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please check your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Create a Veo prompt for a short cinematic story about a courier delivering a package to a recipient.
        The story consists of 6 connected scenes. Each scene is 8 seconds (48s total).
        
        MANDATORY REQUIREMENTS:
        1. Character personality and voice must remain consistent across all scenes.
        2. Each scene must have clear, non-ambiguous actions and transitions.
        3. Include a scene where the recipient opens the package. The recipient reacts based on their personality, and the courier is affected by the reaction.
        4. Write in English for descriptions, but ALL character dialogues MUST be in Indonesian.
        
        COURIER DETAILS:
        - Name: ${courier.name}
        - Type: ${courier.type}
        - Visual: ${courier.visual}
        - Personality: ${courier.personality}
        - Traits: ${courier.traits}
        - Characteristic: ${courier.characteristic}
        - Vide: ${courier.vide}
        - Outfit: ${courier.outfit}
        - Vehicle: ${courier.vehicle}
        
        RECIPIENT DETAILS:
        - Name: ${recipient.name}
        - Type: ${recipient.type}
        - Visual: ${recipient.visual}
        - Personality: ${recipient.personality}
        - Traits: ${recipient.traits}
        - Characteristic: ${recipient.characteristic}
        - Vide: ${recipient.vide}
        - Outfit: ${recipient.outfit}
        - Location: ${recipient.location}
        - Package: ${recipient.package}
        - Reaction: ${recipient.reaction}
        
        ENVIRONMENT:
        - Weather: ${env.weather}
        - Atmosphere: ${env.atmosphere}
        - Tone: ${env.tone}
        
        OUTPUT FORMAT:
        Return a JSON object with:
        {
          "title": "A catchy title for the story",
          "scenes": [
            {
              "sceneNumber": 1,
              "visualDescription": "...",
              "cameraMovement": "...",
              "sfx": "...",
              "dialogue": "..."
            },
            ... (6 scenes total)
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.NUMBER },
                    visualDescription: { type: Type.STRING },
                    cameraMovement: { type: Type.STRING },
                    sfx: { type: Type.STRING },
                    dialogue: { type: Type.STRING },
                  },
                  required: ["sceneNumber", "visualDescription", "cameraMovement", "sfx", "dialogue"]
                }
              }
            },
            required: ["title", "scenes"]
          }
        }
      });

      if (!response.text) {
        throw new Error("No response text received from Gemini.");
      }

      const result = JSON.parse(response.text || "{}");
      setGeneratedPrompt(result);
    } catch (err: any) {
      console.error("Generation failed:", err);
      setErrorHeader(err.message || "Unknown error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedPrompt) return;
    
    let text = `Veo Cinematic Prompt: ${generatedPrompt.title}\n\n`;
    generatedPrompt.scenes.forEach(s => {
      text += `SCENE ${s.sceneNumber}\n`;
      text += `Visual: ${s.visualDescription}\n`;
      text += `Camera: ${s.cameraMovement}\n`;
      text += `SFX: ${s.sfx}\n`;
      text += `Dialogue: ${s.dialogue}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySceneToClipboard = (scene: Scene, idx: number) => {
    let text = `SCENE ${scene.sceneNumber}\n`;
    text += `Visual: ${scene.visualDescription}\n`;
    text += `Camera: ${scene.cameraMovement}\n`;
    text += `SFX: ${scene.sfx}\n`;
    text += `Dialogue: ${scene.dialogue}`;

    navigator.clipboard.writeText(text);
    setCopiedSceneIdx(idx);
    setTimeout(() => setCopiedSceneIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#151619] text-[#FFFFFF] font-sans selection:bg-[#FF4444] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#FFFFFF10] bg-[#151619]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF4444] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,68,68,0.3)]">
              <Film className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">VEO PROMPT STUDIO</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#8E9299] font-mono">Cinematic Storytelling Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setCourier(DEFAULT_COURIER);
                setRecipient(DEFAULT_RECIPIENT);
                setEnv(DEFAULT_ENV);
              }}
              className="text-[#8E9299] hover:text-white hover:bg-[#FFFFFF08] text-[10px] font-mono uppercase tracking-widest"
            >
              <RefreshCw className="w-3 h-3 mr-2" /> Reset Defaults
            </Button>
            <Badge variant="outline" className="border-[#FFFFFF20] text-[#8E9299] font-mono text-[10px]">
              V3.1 PRO
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="courier" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#25262b] border border-[#FFFFFF20] p-1 h-12">
              <TabsTrigger 
                value="courier" 
                className="text-[#FFFFFF60] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg transition-all"
              >
                <Truck className="w-4 h-4 mr-2" /> Courier
              </TabsTrigger>
              <TabsTrigger 
                value="recipient" 
                className="text-[#FFFFFF60] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg transition-all"
              >
                <User className="w-4 h-4 mr-2" /> Recipient
              </TabsTrigger>
              <TabsTrigger 
                value="env" 
                className="text-[#FFFFFF60] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-lg transition-all"
              >
                <Cloud className="w-4 h-4 mr-2" /> World
              </TabsTrigger>
            </TabsList>

            {/* Courier Tab */}
            <TabsContent value="courier" className="mt-4 space-y-4">
              <Card className="bg-[#25262b] border-[#FFFFFF15] text-white shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-[#8E9299] uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Courier Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Name</Label>
                    <Input 
                      value={courier.name} 
                      onChange={e => setCourier({...courier, name: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444] transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Type</Label>
                    <Input 
                      value={courier.type} 
                      onChange={e => setCourier({...courier, type: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Visual Description</Label>
                    <Input 
                      value={courier.visual} 
                      onChange={e => setCourier({...courier, visual: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Personality</Label>
                    <Input 
                      value={courier.personality} 
                      onChange={e => setCourier({...courier, personality: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Traits</Label>
                    <Input 
                      value={courier.traits} 
                      onChange={e => setCourier({...courier, traits: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Characteristic</Label>
                    <Input 
                      value={courier.characteristic} 
                      onChange={e => setCourier({...courier, characteristic: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Vide</Label>
                    <Input 
                      value={courier.vide} 
                      onChange={e => setCourier({...courier, vide: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Outfit</Label>
                    <Input 
                      value={courier.outfit} 
                      onChange={e => setCourier({...courier, outfit: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Vehicle</Label>
                    <Input 
                      value={courier.vehicle} 
                      onChange={e => setCourier({...courier, vehicle: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recipient Tab */}
            <TabsContent value="recipient" className="mt-4 space-y-4">
              <Card className="bg-[#25262b] border-[#FFFFFF15] text-white shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-[#8E9299] uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" /> Recipient Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Name</Label>
                    <Input 
                      value={recipient.name} 
                      onChange={e => setRecipient({...recipient, name: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Type</Label>
                    <Input 
                      value={recipient.type} 
                      onChange={e => setRecipient({...recipient, type: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Visual Description</Label>
                    <Input 
                      value={recipient.visual} 
                      onChange={e => setRecipient({...recipient, visual: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Personality</Label>
                    <Input 
                      value={recipient.personality} 
                      onChange={e => setRecipient({...recipient, personality: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Traits</Label>
                    <Input 
                      value={recipient.traits} 
                      onChange={e => setRecipient({...recipient, traits: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Characteristic</Label>
                    <Input 
                      value={recipient.characteristic} 
                      onChange={e => setRecipient({...recipient, characteristic: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Vide</Label>
                    <Input 
                      value={recipient.vide} 
                      onChange={e => setRecipient({...recipient, vide: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Outfit</Label>
                    <Input 
                      value={recipient.outfit} 
                      onChange={e => setRecipient({...recipient, outfit: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Location</Label>
                    <Input 
                      value={recipient.location} 
                      onChange={e => setRecipient({...recipient, location: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Package</Label>
                    <Input 
                      value={recipient.package} 
                      onChange={e => setRecipient({...recipient, package: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Reaction</Label>
                    <Input 
                      value={recipient.reaction} 
                      onChange={e => setRecipient({...recipient, reaction: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Environment Tab */}
            <TabsContent value="env" className="mt-4 space-y-4">
              <Card className="bg-[#25262b] border-[#FFFFFF15] text-white shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-[#8E9299] uppercase tracking-wider flex items-center gap-2">
                    <Cloud className="w-4 h-4" /> Environment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Weather</Label>
                    <Input 
                      value={env.weather} 
                      onChange={e => setEnv({...env, weather: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Atmosphere</Label>
                    <Input 
                      value={env.atmosphere} 
                      onChange={e => setEnv({...env, atmosphere: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase text-[#8E9299]">Tone Example</Label>
                    <Textarea 
                      value={env.tone} 
                      onChange={e => setEnv({...env, tone: e.target.value})}
                      className="bg-[#151619] border-[#FFFFFF10] focus:border-[#FF4444] min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full h-14 bg-[#FF4444] hover:bg-[#FF3333] text-white font-bold text-lg shadow-[0_0_30px_rgba(255,68,68,0.2)] transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                GENERATING STORY...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                GENERATE VEO PROMPT
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <Card className="bg-[#1c1d21] border-[#FFFFFF10] text-white h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#FFFFFF08] py-4">
              <div>
                <CardTitle className="text-sm font-mono text-[#8E9299] uppercase tracking-wider">
                  Storyboard Output
                </CardTitle>
                {generatedPrompt && (
                  <CardDescription className="text-[#FFFFFF] font-bold mt-1">
                    {generatedPrompt.title}
                  </CardDescription>
                )}
              </div>
              {generatedPrompt && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="border-[#FFFFFF20] hover:bg-[#FFFFFF08] text-[#8E9299] hover:text-white"
                >
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "COPIED" : "COPY FULL PROMPT"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-250px)] p-6">
                <AnimatePresence mode="wait">
                  {errorHeader ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20"
                    >
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                        <RefreshCw className="w-8 h-8 text-red-500" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-red-500">Generation Failed</h3>
                        <p className="text-sm text-[#8E9299] max-w-xs">{errorHeader}</p>
                        <Button 
                          variant="link" 
                          onClick={handleGenerate}
                          className="text-[#FF4444] hover:text-[#FF3333]"
                        >
                          Try Again
                        </Button>
                      </div>
                    </motion.div>
                  ) : !generatedPrompt && !isGenerating ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20"
                    >
                      <div className="w-16 h-16 bg-[#FFFFFF05] rounded-full flex items-center justify-center border border-[#FFFFFF10]">
                        <Film className="w-8 h-8 text-[#8E9299]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-[#8E9299]">No Story Generated Yet</h3>
                        <p className="text-sm text-[#555] max-w-xs">Configure your characters and environment, then hit generate to create a 6-scene cinematic prompt.</p>
                      </div>
                    </motion.div>
                  ) : isGenerating ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse space-y-3">
                          <div className="h-4 bg-[#FFFFFF08] rounded w-1/4" />
                          <div className="h-24 bg-[#FFFFFF08] rounded w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {generatedPrompt?.scenes.map((scene, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-[#FF444420] text-[#FF4444] rounded flex items-center justify-center font-mono font-bold text-sm border border-[#FF444430]">
                              {scene.sceneNumber}
                            </div>
                            <Separator className="flex-1 bg-[#FFFFFF08]" />
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-[10px] border-[#FFFFFF10] text-[#8E9299]">
                                8 SECONDS
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copySceneToClipboard(scene, idx)}
                                className="w-8 h-8 text-[#8E9299] hover:text-white hover:bg-[#FFFFFF08]"
                                title="Copy Scene Prompt"
                              >
                                {copiedSceneIdx === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8E9299] font-mono">
                                  <Package className="w-3 h-3" /> Visual Action
                                </div>
                                <p className="text-sm leading-relaxed text-[#E0E0E0]">
                                  {scene.visualDescription}
                                </p>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8E9299] font-mono">
                                  <Camera className="w-3 h-3" /> Camera Movement
                                </div>
                                <p className="text-xs text-[#8E9299] italic">
                                  {scene.cameraMovement}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4 bg-[#FFFFFF03] p-4 rounded-lg border border-[#FFFFFF05]">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#8E9299] font-mono">
                                  <Volume2 className="w-3 h-3" /> Audio / SFX
                                </div>
                                <p className="text-xs text-[#8E9299]">
                                  {scene.sfx}
                                </p>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#FF4444] font-mono">
                                  <MessageSquare className="w-3 h-3" /> Dialogue (ID)
                                </div>
                                <p className="text-sm font-medium text-white italic">
                                  "{scene.dialogue}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#FFFFFF08] py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest">
            Built for Google Veo • AI-Powered Cinematic Prompting
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest">System Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
