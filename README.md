# Treasury Risk Analysis – USD/MYR Rate Shock

## 📌 Project Overview
This project simulates **treasury risk exposure** for a company holding unhedged USD/MYR positions.  
It models the impact of a **200 basis point (bps) interest rate shock** on foreign exchange exposures and evaluates the effectiveness of hedging strategies.  

The goal: demonstrate how corporate treasuries can **quantify risk, optimize hedge ratios, and visualize potential losses** under stress scenarios.  

---

## 🔧 Methodology
1. **Dummy FX Exposure Data**
   - Generated ~100 trades with different USD notional sizes at a base rate of 4.65 MYR/USD.

2. **Shock Modeling**
   - Applied a **+200 bps rate shock** to MYR.
   - Recalculated FX exposures to measure unhedged P&L impact.

3. **Hedging Simulation**
   - Modeled the use of a simple forward contract as a hedge.
   - Estimated hedge cost and effectiveness.

4. **Optimal Hedge Ratio**
   - Calculated the ratio of hedged vs unhedged positions that minimizes risk.

---

## 📊 Key Results
- **P&L Sensitivity**: Quantified the impact of a 200bps shock on total FX exposure.  
- **Hedge Cost vs. Exposure**: Compared hedged vs. unhedged outcomes.  
- **Optimal Hedge Ratio**: Identified hedge ratios that reduce volatility while controlling cost.  

---

## 📈 Visualizations
- P&L sensitivity curve under interest rate shock  
- Hedge cost vs. exposure comparison chart  
- Distribution of potential losses (Monte Carlo simulation)  

*(Insert screenshots of charts here, e.g. `outputs/pl_sensitivity.png`)*

---

## 📂 Repository Structure
