/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import React from 'react';
import Sample from 'src/models/Sample';

export default class Component extends Sample {
  constructor(props) {
    super(props);
  }

  get has_density() {
    return this.density > 0 && this.starting_molarity_value === 0;
  }

  get amount_mol() {
    return this._amount_mol;
  }

  set amount_mol(amount_mol) {
    this._amount_mol = amount_mol;
  }

  get amount_g() {
    return this._amount_g;
  }

  set amount_g(amount_g) {
    return this._amount_g = amount_g;
  }

  get amount_l() {
    return this._amount_l;
  }

  set amount_l(amount_l) {
    return this._amount_l = amount_l;
  }

  get svgPath() {
    return this.molecule && this.molecule.molecule_svg_file
      ? `/images/molecules/${this.molecule.molecule_svg_file}` : '';
  }

  // Volume related codes

  handleVolumeChange(amount, totalVolume) {
    if (!amount.unit || Number.isNaN(amount.value)) return;

    this.setVolume(amount);

    const purity = this.purity || 1.0;

    if (this.material_group === 'liquid') {
      if (this.density && this.density > 0) {
        this.calculateAmountFromDensity(totalVolume, purity);
      } else if (this.starting_molarity_value && this.starting_molarity_value > 0) {
        this.calculateAmountFromConcentration(totalVolume, purity);
      }
    }

    if (totalVolume && totalVolume > 0) {
      const concentration = this.amount_mol / (totalVolume * purity);
      this.molarity_value = concentration;
      this.concn = concentration;
    }
  }

  setVolume(amount) {
    if (this.material_group === 'liquid') {
      this.amount_l = amount.value;
    } else if (this.material_group === 'solid') {
      this.amount_g = amount.value;
    }
  }

  // Volume related codes ends

  // Amount related codes

  handleAmountChange(amount, totalVolume) {
    if (Number.isNaN(amount.value) || amount.unit !== 'mol') return;

    this.amount_mol = amount.value;

    const purity = this.purity || 1.0;

    if (this.material_group === 'liquid') {
      if (this.density && this.density > 0) { // if density is given
        this.calculateVolumeFromDensity(purity);
      } else if (this.starting_molarity_value && this.starting_molarity_value > 0) { // if stock concentration is given
        this.calculateVolumeFromConcentration(purity);
      }
    }

    if (totalVolume && totalVolume > 0) {
      const concentration = this.amount_mol / (totalVolume * purity);
      this.molarity_value = concentration;
      this.concn = concentration;
      this.molarity_unit = 'M';
    }
  }

  // Amount related codes ends

  // Stock related codes

  setConc(amount, totalVolume, concType, lockColumn) {
    if (!amount.unit || Number.isNaN(amount.value) || amount.unit !== 'mol/l') { return; }

    if (this.density && this.density > 0 && concType !== 'startingConc' && this.material_group !== 'solid') {
      this.setMolarityDensity(amount, totalVolume);
    } else {
      this.handleStockChange(amount, totalVolume, concType, lockColumn);
    }
  }

  handleStockChange(amount, totalVolume, concType, lockColumn) {
    this.setConcentration(amount, concType, lockColumn);

    const purity = this.purity || 1.0;

    if (this.amount_l && this.amount_l > 0) {
      this.calculateAmountFromConcentration(totalVolume, purity);
    } else if (this.amount_mol && this.amount_mol > 0) {
      this.calculateVolumeFromConcentration(purity);
    }
  }

  setConcentration(amount, concType, lockColumn) {
    if (concType !== 'startingConc') {
      this.concn = amount.value;
      this.molarity_value = amount.value;
      this.molarity_unit = amount.unit;
    } else if (!lockColumn) {
      this.starting_molarity_value = amount.value;
      this.starting_molarity_unit = amount.unit;
    }

    this.density = 0;
  }

  // Stock related codes ends

  // Density related codes

  handleDensityChange(amount, lockColumn, totalVolume) {
    if (!amount.unit || Number.isNaN(amount.value) || amount.unit !== 'g/ml') return;

    const purity = this.purity || 1.0;

    this.setDensity(amount, lockColumn);

    if (this.amount_l && this.amount_l > 0) {
      this.calculateAmountFromDensity(totalVolume, purity);
    } else if (this.amount_mol && this.amount_mol > 0) {
      this.calculateVolumeFromDensity(purity);
    }
  }

  setDensity(amount, lockColumn) {
    if (!lockColumn) {
      this.density = amount.value;
      this.starting_molarity_value = 0;
    }
  }

  // Density related codes ends

  // Case 1.1: Calculate Amount from Volume, Density, Molecular Weight, and Purity
  calculateAmountFromDensity(totalVolume, purity) {
    this.starting_molarity_value = 0;

    if (this.material_group === 'liquid') {
      this.amount_g = (this.amount_l * 1000) * this.density;
      this.amount_mol = (this.amount_g * purity) / this.molecule_molecular_weight;
    }
  }

  // Case 1.2: Calculate Amount from Volume, Concentration, and Purity
  calculateAmountFromConcentration(totalVolume, purity) {
    this.amount_mol = this.starting_molarity_value * this.amount_l * purity;

    if (totalVolume) {
      const concentration = this.amount_mol / (totalVolume * purity);
      this.concn = concentration;
      this.molarity_value = concentration;
      this.molarity_unit = 'M';
    }
  }

  // Case 2.1: Calculate Volume from Amount, Density, Molecular Weight, and Purity
  calculateVolumeFromDensity(purity) {
    this.starting_molarity_value = 0;
    this.amount_l = (this.amount_mol * this.molecule_molecular_weight * purity) / (this.density * 1000);
  }

  // Case 2.2: Calculate Volume from Amount, Concentration, and Purity
  calculateVolumeFromConcentration(purity) {
    this.density = 0;
    this.amount_l = this.amount_mol / (this.starting_molarity_value * purity);
  }

  updateRatio(newRatio, materialGroup, totalVolume, referenceMoles) {
    if (this.equivalent === newRatio) { return; }

    const purity = this.purity || 1.0;
    this.amount_mol = newRatio * referenceMoles;
    this.equivalent = newRatio;

    if (materialGroup === 'liquid') {
      if (!this.has_density) {
        this.amount_l = this.amount_mol / (this.starting_molarity_value * purity);
        this.molarity_value = this.concn = this.amount_mol / (totalVolume * purity);
        this.molarity_unit = 'M';
      } else if (this.has_density) {
        this.amount_g = (this.amount_mol * this.molecule_molecular_weight) / purity;
        this.amount_l = this.amount_g / (this.density * 1000);
        this.molarity_value = this.concn = this.amount_mol / (totalVolume * purity);
        this.molarity_unit = 'M';
      }
    } else if (materialGroup === 'solid') {
      this.amount_g = (this.amount_mol * this.molecule_molecular_weight) / purity;
      this.molarity_value = this.concn = this.amount_mol / (totalVolume * purity);
    }
  }

  setPurity(purity, totalVolume) {
    if (!isNaN(purity) && purity >= 0 && purity <= 1) {
      this.purity = purity;
      this.amount_mol = this.molarity_value * totalVolume * this.purity;
    }
  }

  get svgPath() {
    return this.molecule && this.molecule.molecule_svg_file
      ? `/images/molecules/${this.molecule.molecule_svg_file}` : '';
  }

  serializeComponent() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      component_properties: {
        amount_mol: this.amount_mol,
        amount_l: this.amount_l,
        amount_g: this.amount_g,
        density: this.density,
        molarity_unit: this.molarity_unit,
        molarity_value: this.molarity_value,
        starting_molarity_value: this.starting_molarity_value,
        starting_molarity_unit: this.starting_molarity_unit,
        molecule_id: this.molecule.id,
        equivalent: this.equivalent,
        parent_id: this.parent_id,
        material_group: this.material_group,
        reference: this.reference,
        purity: this.purity,
      }
    };
  }
}
