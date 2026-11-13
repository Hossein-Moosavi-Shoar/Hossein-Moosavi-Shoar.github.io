---
layout: page
permalink: /thesis/
title: Thesis
description: Graduate and undergraduate thesis work.
nav: true
nav_order: 5
---

## M.Sc. Thesis — Sharif University of Technology (2023 – 2026)

**The Art of Heat Exchange: Exploring Paint Rheology and Patterns on Heat Exchangers**

<p class="thesis-abstract">
My master's thesis asks a deceptively simple question: what happens when you spray paint
onto a plate-fin tube-bundle heat exchanger? The answer is a story of penetration and
deposition — how far the paint travels into the fin channels, and how the paint's
composition and rheology shape the pattern it leaves behind. I studied this empirically,
designing and building three generations of spray-deposition rigs and varying spray
distance, liquid volume, pigment concentration, and pigment type on Newtonian spray
paints, with non-Newtonian rheology surveyed as future work.
</p>

<p class="thesis-abstract">
Deposited patterns were quantified through a scanner-based image-analysis pipeline in
Python and MATLAB, extracting roughly twelve metrics covering coverage, penetration,
fragmentation, shape, and spatial distribution. Because deposition is a noisy process,
the experimental parameters were optimized with an L8 Taguchi design — the best tested
condition reduced the coefficient of variation of coverage from about 40% to 26%. In
parallel, I implemented a two-phase VOF model in ANSYS Fluent, validated to roughly 6%
error against the Dowlati et al. (1990) tube-bundle reference case; the spray model
itself was discontinued because droplet instability, breakup, and splashing were not
represented adequately at the tested conditions.
</p>

<div class="pub-line">
  <span class="pub-year">in preparation</span>
  <div>
    <p class="pub-title">Master's thesis journal paper — paint penetration study</p>
    <p class="pub-venue">Experimental study of paint rheology effects on spray penetration in heat exchangers</p>
  </div>
</div>

## B.Sc. Thesis — Isfahan University of Technology (2023)

**Air–Water Generator Using Thermoelectric Coolers: Semi-Analytical Modeling**

<p class="thesis-abstract">
My bachelor's thesis modeled heat exchangers integrated with thermoelectric coolers (TECs) for
atmospheric water harvesting — a device that extracts drinking water from air. I developed
semi-analytical models of different heat-exchanger/TEC configurations to analyze the efficiency
of the technology, balancing thermoelectric performance against heat-exchanger design. The thesis
resulted in a journal paper on the thermo-economics of thermoelectric-based atmospheric water
harvesters.
</p>

<div class="pub-line">
  <span class="pub-year">2024</span>
  <div>
    <p class="pub-title">Journal publication from the bachelor's thesis — thermoelectric water harvesting</p>
    <p class="pub-venue">Int. J. of Thermofluids ·
      <a href="https://doi.org/10.1016/j.ijft.2024.100740" target="_blank" rel="noopener">doi:10.1016/j.ijft.2024.100740</a></p>
  </div>
</div>
