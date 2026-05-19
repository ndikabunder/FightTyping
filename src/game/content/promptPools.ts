import type { Limb } from "../types";
import type { WordPoolTier } from "./levels";

const basePromptPools: Record<WordPoolTier, Record<Limb, string[]>> = {
  level1: {
    rightHand: ["jab", "tap", "hit", "snap", "pop", "box", "rush", "bolt", "dash", "clip"],
    leftHand: ["hook", "grip", "step", "shift", "guard", "focus", "cover", "block", "brace", "catch"],
    rightLeg: ["kick", "heel", "knee", "round", "thrust", "impact", "drive", "plant", "pivot", "stamp"],
    leftLeg: ["sweep", "slide", "ankle", "break", "drift", "skid", "lunge", "feint", "reset", "pace"]
  },
  level2: {
    rightHand: ["snap", "quick", "spark", "strike", "upper", "needle", "burst", "hammer", "rocket", "bullet"],
    leftHand: ["cross", "guard", "drive", "anchor", "rhythm", "parry", "shield", "weave", "steady", "clinch"],
    rightLeg: ["round", "thrust", "impact", "launch", "balance", "crush", "rocket", "hammer", "spring", "whirl"],
    leftLeg: ["sweep", "slide", "stomp", "ankle", "footwork", "reaction", "shuffle", "sidestep", "breaker", "switch"]
  },
  level3: {
    rightHand: ["counter", "follow", "rocket", "needle", "breaker", "pressure", "jabber", "crackle", "rupture", "blitzer"],
    leftHand: ["anchor", "rhythm", "deflect", "barrier", "counter", "grapple", "steady", "covering", "balance", "redirect"],
    rightLeg: ["launcher", "rotation", "fracture", "impact", "thunder", "roundhouse", "balance", "springer", "crusher", "drivekick"],
    leftLeg: ["footwork", "reaction", "sweeper", "sidestep", "stomper", "balance", "rotation", "pivoting", "reversal", "breaker"]
  },
  level4: {
    rightHand: ["precision", "overdrive", "reaction", "decisive", "pressure", "voltage", "cascade", "rupture", "haymaker", "accelerate"],
    leftHand: ["momentum", "deflection", "counter", "followup", "guarding", "stability", "formation", "redirection", "bracework", "intercept"],
    rightLeg: ["footwork", "rotation", "launcher", "overload", "thunder", "backspin", "crosskick", "sidekick", "kneestrike", "drillkick"],
    leftLeg: ["balance", "reaction", "decisive", "sweeping", "reversal", "lowline", "tripwire", "sidestep", "grounding", "pivotstep"]
  },
  level5: {
    rightHand: ["precision", "overload", "pressure", "decisive", "reaction", "shockwave", "breakpoint", "uppercut", "haymaker", "aftershock"],
    leftHand: ["momentum", "counter", "fracture", "followup", "guarding", "intercept", "defensive", "redirect", "bracehold", "stabilize"],
    rightLeg: ["footwork", "pressure", "overload", "rotation", "launcher", "roundhouse", "crosskick", "shockstep", "thunderkick", "breakpoint"],
    leftLeg: ["balance", "reaction", "precision", "decisive", "sweeping", "groundwork", "tripline", "footsweep", "reposition", "stability"]
  },
  level6: {
    rightHand: ["acceleration", "calibration", "counterstrike", "breakpoint", "afterimage", "shockburst", "quickfire", "voltage", "chainlink", "stagger"],
    leftHand: ["deflection", "stabilizer", "interception", "guardbreak", "momentum", "bracepoint", "redirector", "counterflow", "formation", "lockstep"],
    rightLeg: ["roundhouse", "thunderkick", "crosskick", "shockstep", "overdrive", "launchpad", "rotation", "sidewinder", "impactline", "drivekick"],
    leftLeg: ["reposition", "footsweep", "groundwork", "tripwire", "sidecycle", "backstep", "footguard", "lowstrike", "stability", "pivotline"]
  },
  level7: {
    rightHand: ["counterstrike", "accelerator", "pressurepoint", "overcurrent", "breakpattern", "aftershock", "voltageburst", "precisionhit", "rapidfollow", "shatterline"],
    leftHand: ["interception", "guardbreaker", "stabilizer", "counterguard", "momentumshift", "redirection", "bracepattern", "deflection", "anchorpoint", "shieldflow"],
    rightLeg: ["thunderkick", "roundhouse", "crossrotation", "impactdriver", "launchvector", "shockrunner", "overloaded", "sidewinder", "rotationlock", "drivebreaker"],
    leftLeg: ["groundshift", "reposition", "footsweeper", "tripbreaker", "pivotguard", "lowpressure", "backstepper", "stability", "sidereaction", "balanceflow"]
  },
  level8: {
    rightHand: ["precisionstrike", "counterpressure", "overloadburst", "reactionchain", "breakthrough", "accelerated", "voltageimpact", "shatterpoint", "followthrough", "decisivehit"],
    leftHand: ["deflectionguard", "momentumanchor", "interceptflow", "counterbalance", "guardformation", "stabilization", "redirectstrike", "bracecontrol", "shieldpattern", "anchorstrike"],
    rightLeg: ["rotationstrike", "thunderimpact", "launcherforce", "overdrivekick", "crosspressure", "vectorstrike", "sidewinderkick", "shockrotation", "drivepressure", "breakkick"],
    leftLeg: ["reactionstep", "precisionstep", "sweepingline", "balanceguard", "groundcontrol", "tripreaction", "pivotpressure", "repositioning", "lowlinekick", "stabilitystep"]
  },
  level9: {
    rightHand: ["overloadpattern", "counterprecision", "pressurebreaker", "decisiveimpact", "reactionburst", "voltagecounter", "aftershockstrike", "breakthroughhit", "acceleration", "precisionchain"],
    leftHand: ["momentumdefense", "counterformation", "fractureguard", "followupanchor", "guardintercept", "redirectionflow", "stabilityhold", "deflectionwall", "bracepressure", "shieldbreaker"],
    rightLeg: ["footworkpressure", "overloadrotation", "launcherimpact", "roundhouseforce", "thunderbreaker", "crosskickvector", "shockstepdrive", "impactrotation", "drivekickchain", "sidewinderforce"],
    leftLeg: ["balancepressure", "reactionpivot", "precisionsweep", "decisivestep", "sweepingcounter", "groundbreaker", "repositionflow", "tripwirestep", "lowpressurekick", "stabilityshift"]
  },
  level10: {
    rightHand: ["counterprecision", "overloadsequence", "pressurebreakpoint", "decisivecounter", "reactionoverdrive", "voltagebreakthrough", "afterimageimpact", "precisionfollowup", "acceleratedstrike", "shattersequence"],
    leftHand: ["momentumredirection", "counterstabilizer", "fracturedeflection", "followupformation", "guardbreakcontrol", "interceptionflow", "bracepointdefense", "shieldpatternbreak", "anchorcontrol", "defensiveoverdrive"],
    rightLeg: ["footworkoverload", "pressurewheelkick", "rotationbreakpoint", "launchersequence", "thunderroundhouse", "crosskickpressure", "impactdrivechain", "sidewinderrotation", "overdrivebreaker", "shocksteplauncher"],
    leftLeg: ["balanceoverdrive", "reactionfootsweep", "precisiongroundwork", "decisivereposition", "sweepingbreakpoint", "groundcontrolshift", "tripwirepressure", "pivotlinebreaker", "stabilitysequence", "lowlineoverdrive"]
  }
};

const extraPromptPools: Record<WordPoolTier, Record<Limb, string[]>> = {
  level1: {
    rightHand: ["jab", "tap", "hit", "pop", "bop", "zap", "bam", "tag", "fist", "sock", "clip", "poke"],
    leftHand: ["guard", "block", "cover", "catch", "hold", "brace", "check", "parry", "clasp", "ready", "frame", "stance"],
    rightLeg: ["kick", "knee", "heel", "step", "plant", "stamp", "drive", "push", "lift", "launch", "thump", "stride"],
    leftLeg: ["sweep", "slide", "skid", "pace", "reset", "feint", "drift", "ankle", "lunge", "shift", "sidle", "glide"]
  },
  level2: {
    rightHand: ["quick", "spark", "upper", "needle", "burst", "hammer", "bullet", "rocket", "snatch", "blaze", "flicker", "jolt"],
    leftHand: ["cross", "anchor", "rhythm", "parry", "shield", "weave", "steady", "clinch", "buffer", "stance", "mirror", "lockup"],
    rightLeg: ["round", "thrust", "impact", "launch", "balance", "crush", "spring", "whirl", "rising", "piston", "snapleg", "wheel"],
    leftLeg: ["stomp", "footwork", "reaction", "shuffle", "sidestep", "breaker", "switch", "lowstep", "cutback", "pivot", "retreat", "evade"]
  },
  level3: {
    rightHand: ["counter", "follow", "breaker", "pressure", "jabber", "crackle", "rupture", "blitzer", "quickdraw", "sparkhit", "rushline", "snapfire"],
    leftHand: ["deflect", "barrier", "grapple", "covering", "redirect", "braceup", "guardline", "parrylock", "holdfast", "screen", "shielded", "intercept"],
    rightLeg: ["launcher", "rotation", "fracture", "thunder", "roundhouse", "springer", "crusher", "drivekick", "wheelkick", "liftkick", "powerstep", "spinkick"],
    leftLeg: ["sweeper", "sidestep", "stomper", "pivoting", "reversal", "breaker", "cutstep", "lowguard", "shiftstep", "backslide", "tripkick", "footslip"]
  },
  level4: {
    rightHand: ["precision", "overdrive", "reaction", "decisive", "voltage", "cascade", "haymaker", "accelerate", "flashpoint", "shockhit", "chainstrike", "rapidshot"],
    leftHand: ["momentum", "deflection", "followup", "guarding", "stability", "formation", "redirection", "bracework", "intercept", "lockguard", "counterhold", "shieldline"],
    rightLeg: ["backspin", "crosskick", "sidekick", "kneestrike", "drillkick", "highwheel", "forcekick", "spinwheel", "pressurekick", "launchline", "arcstep", "kickdrive"],
    leftLeg: ["sweeping", "reversal", "lowline", "tripwire", "grounding", "pivotstep", "cutangle", "flowstep", "lowguard", "sideflow", "trapstep", "slideguard"]
  },
  level5: {
    rightHand: ["shockwave", "breakpoint", "uppercut", "aftershock", "impactjab", "chainburst", "forcepunch", "powerline", "quickbreak", "burstpoint", "rushimpact", "snapchain"],
    leftHand: ["fracture", "defensive", "bracehold", "stabilize", "anchorlock", "guardflow", "redirected", "counterwall", "holdpoint", "shieldwork", "braceline", "coverguard"],
    rightLeg: ["shockstep", "thunderkick", "breakpoint", "forcewheel", "drivestep", "kickpoint", "pressurearc", "impactkick", "overkick", "rotator", "launchkick", "wheelbreak"],
    leftLeg: ["groundwork", "tripline", "footsweep", "reposition", "stability", "shiftline", "lowpivot", "sweepguard", "balancecut", "retreatline", "groundstep", "flowguard"]
  },
  level6: {
    rightHand: ["acceleration", "calibration", "counterstrike", "afterimage", "shockburst", "quickfire", "chainlink", "stagger", "impactchain", "rapidvoltage", "burstvector", "breakpulse"],
    leftHand: ["stabilizer", "interception", "guardbreak", "bracepoint", "redirector", "counterflow", "lockstep", "anchorflow", "shieldpoint", "guardvector", "bracechain", "deflectline"],
    rightLeg: ["launchpad", "sidewinder", "impactline", "drivekick", "stormkick", "wheelimpact", "rotationarc", "pressurewheel", "kickvector", "shockdrive", "overstep", "launchdrive"],
    leftLeg: ["sidecycle", "backstep", "footguard", "lowstrike", "pivotline", "groundshift", "repositioner", "tripguard", "balancewire", "lowvector", "stepguard", "shiftguard"]
  },
  level7: {
    rightHand: ["accelerator", "pressurepoint", "overcurrent", "breakpattern", "voltageburst", "precisionhit", "rapidfollow", "shatterline", "impactbreaker", "counterburst", "strikevector", "chainpressure"],
    leftHand: ["guardbreaker", "counterguard", "momentumshift", "bracepattern", "anchorpoint", "shieldflow", "interceptlock", "deflectchain", "guardanchor", "redirection", "bracevector", "counterbrace"],
    rightLeg: ["crossrotation", "impactdriver", "launchvector", "shockrunner", "overloaded", "rotationlock", "drivebreaker", "thunderdrive", "sidewheel", "kickbreaker", "impactwheel", "launchrunner"],
    leftLeg: ["groundshift", "footsweeper", "tripbreaker", "pivotguard", "lowpressure", "backstepper", "sidereaction", "balanceflow", "shiftbreaker", "groundguard", "pivotvector", "lowrunner"]
  },
  level8: {
    rightHand: ["precisionstrike", "counterpressure", "overloadburst", "reactionchain", "breakthrough", "voltageimpact", "shatterpoint", "followthrough", "decisivehit", "impactsequence", "burstcounter", "overdrivehit"],
    leftHand: ["deflectionguard", "momentumanchor", "interceptflow", "counterbalance", "guardformation", "stabilization", "redirectstrike", "bracecontrol", "shieldpattern", "anchorstrike", "countershield", "guardsequence"],
    rightLeg: ["rotationstrike", "thunderimpact", "launcherforce", "overdrivekick", "crosspressure", "vectorstrike", "sidewinderkick", "shockrotation", "drivepressure", "breakkick", "wheelpressure", "launchimpact"],
    leftLeg: ["reactionstep", "precisionstep", "sweepingline", "balanceguard", "groundcontrol", "tripreaction", "pivotpressure", "repositioning", "lowlinekick", "stabilitystep", "groundvector", "sweepsequence"]
  },
  level9: {
    rightHand: ["overloadpattern", "counterprecision", "pressurebreaker", "decisiveimpact", "reactionburst", "voltagecounter", "aftershockstrike", "breakthroughhit", "precisionchain", "impactoverdrive", "countersequence", "shattercounter"],
    leftHand: ["momentumdefense", "counterformation", "fractureguard", "followupanchor", "guardintercept", "redirectionflow", "stabilityhold", "deflectionwall", "bracepressure", "shieldbreaker", "anchorformation", "guardoverdrive"],
    rightLeg: ["footworkpressure", "overloadrotation", "launcherimpact", "roundhouseforce", "thunderbreaker", "crosskickvector", "shockstepdrive", "impactrotation", "drivekickchain", "sidewinderforce", "rotationbreaker", "pressurelaunch"],
    leftLeg: ["balancepressure", "reactionpivot", "precisionsweep", "decisivestep", "sweepingcounter", "groundbreaker", "repositionflow", "tripwirestep", "lowpressurekick", "stabilityshift", "pivotbreaker", "groundsequence"]
  },
  level10: {
    rightHand: ["overloadsequence", "pressurebreakpoint", "decisivecounter", "reactionoverdrive", "voltagebreakthrough", "afterimageimpact", "precisionfollowup", "acceleratedstrike", "shattersequence", "counteroverdrive", "impactbreakthrough", "finalcounter"],
    leftHand: ["momentumredirection", "counterstabilizer", "fracturedeflection", "followupformation", "guardbreakcontrol", "interceptionflow", "bracepointdefense", "shieldpatternbreak", "anchorcontrol", "defensiveoverdrive", "redirectionmatrix", "guardfinale"],
    rightLeg: ["footworkoverload", "pressurewheelkick", "rotationbreakpoint", "launchersequence", "thunderroundhouse", "crosskickpressure", "impactdrivechain", "sidewinderrotation", "overdrivebreaker", "shocksteplauncher", "rotationoverdrive", "finalroundhouse"],
    leftLeg: ["balanceoverdrive", "reactionfootsweep", "precisiongroundwork", "decisivereposition", "sweepingbreakpoint", "groundcontrolshift", "tripwirepressure", "pivotlinebreaker", "stabilitysequence", "lowlineoverdrive", "groundoverdrive", "finalsweep" ]
  }
};

export const promptPools = mergePromptPools(basePromptPools, extraPromptPools);

function mergePromptPools(base: Record<WordPoolTier, Record<Limb, string[]>>, extra: Record<WordPoolTier, Record<Limb, string[]>>) {
  return Object.fromEntries(
    Object.entries(base).map(([tier, limbs]) => [
      tier,
      Object.fromEntries(
        Object.entries(limbs).map(([limb, words]) => [limb, [...new Set([...words, ...extra[tier as WordPoolTier][limb as Limb]])]])
      )
    ])
  ) as Record<WordPoolTier, Record<Limb, string[]>>;
}

export const limbLabels: Record<Limb, string> = {
  rightHand: "Right Hand",
  leftHand: "Left Hand",
  rightLeg: "Right Leg",
  leftLeg: "Left Leg"
};
