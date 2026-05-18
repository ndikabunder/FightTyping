import type { Limb } from "../types";
import type { WordPoolTier } from "./levels";

export const promptPools: Record<WordPoolTier, Record<Limb, string[]>> = {
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
    rightLeg: ["rotationstrike", "thunderimpact", "launcherforce", "overdrivekick", "crosspressure", "impactvector", "sidewinderkick", "shockrotation", "drivepressure", "breakkick"],
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

export const limbLabels: Record<Limb, string> = {
  rightHand: "Right Hand",
  leftHand: "Left Hand",
  rightLeg: "Right Leg",
  leftLeg: "Left Leg"
};
