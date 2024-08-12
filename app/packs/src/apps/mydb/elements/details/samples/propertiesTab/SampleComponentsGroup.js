import React from 'react';
import PropTypes from 'prop-types';
import {
  Button, OverlayTrigger, Tooltip, Tab, Tabs, ControlLabel
} from 'react-bootstrap';
import Sample from 'src/models/Sample';
import Component from 'src/models/Component';
import SampleComponent from 'src/apps/mydb/elements/details/samples/propertiesTab/SampleComponent';

const SampleComponentsGroup = ({
  materialGroup, deleteMixtureComponent, onChange, sample,
  headIndex, dropSample, dropMaterial, lockAmountColumn, lockAmountColumnSolids, switchAmount, sampleComponents,
  showModalWithMaterial, activeTab, handleTabSelect, enableComponentLabel, enableComponentPurity
}) => {
  const contents = [];
  if (sampleComponents && sampleComponents.length > 0) {
    sampleComponents = sampleComponents.map((component) => {
      if (!(component instanceof Component)) {
        return new Component(component);
      }
      return component;
    });
    let index = headIndex;
    sampleComponents.forEach((sampleComponent) => {
      index += 1;
      contents.push((
        <SampleComponent
          sample={sample}
          onChange={onChange}
          key={sampleComponent.id}
          material={sampleComponent}
          materialGroup={materialGroup}
          deleteMaterial={(sc) => deleteMixtureComponent(sc, materialGroup)}
          index={index}
          dropMaterial={dropMaterial}
          dropSample={dropSample}
          lockAmountColumn={lockAmountColumn}
          lockAmountColumnSolids={lockAmountColumnSolids}
          showModalWithMaterial={showModalWithMaterial}
          activeTab={activeTab}
          handleTabSelect={handleTabSelect}
          enableComponentLabel={enableComponentLabel}
          enableComponentPurity={enableComponentPurity}
        />
      ));
    });
  }

  const headers = {
    name: 'Label',
    amount: 'Amount',
    mass: 'Mass',
    volume: 'Volume',
    startingConc: 'Stock',
    concn: 'Total Conc.',
    eq: 'Ratio',
    ref: 'Ref',
    purity: 'Purity',
    density: 'Density',
  };

  if (materialGroup === 'solid') {
    headers.group = 'Solids';
  } else {
    headers.group = 'Liquids';
  }

  const switchAmountTooltip = () => (
    <Tooltip id="assign_button">
      Lock/unlock amounts <br /> (mass/volume/mol)
    </Tooltip>
  );

  const SwitchAmountButton = (lockAmountColumn, switchAmount, materialGroup) => (
    <OverlayTrigger placement="top" overlay={switchAmountTooltip()}>
      <Button
        id="lock_amount_column_btn"
        bsSize="xsmall"
        bsStyle={lockAmountColumn ? 'warning' : 'default'}
        onClick={() => switchAmount(materialGroup)}
      >
        <i className={lockAmountColumn ? 'fa fa-lock' : 'fa fa-unlock'} />
      </Button>
    </OverlayTrigger>
  );

  return (
    <div>
      <table width="100%" className="sample-scheme">
        <colgroup>
          <col style={{ width: '4%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '4%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '2%' }} />
          <col style={{ width: '10%' }} />
          {enableComponentLabel && <col style={{ width: '4%' }} />}
          {enableComponentPurity && <col style={{ width: '4%' }} />}
        </colgroup>
        <thead>
        <tr>
          <th/>
          <th>{headers.group}</th>
          <th/>
          {materialGroup === 'solid' && (
            <th style={{ padding: '3px 3px' }}>
              {SwitchAmountButton(lockAmountColumnSolids, switchAmount, materialGroup)} {headers.mass}
            </th>
          )}

          {materialGroup === 'liquid' && (
            <th>
              {headers.startingConc}
            </th>
          )}
          {materialGroup === 'liquid' && (
            <th>
              {headers.density}
            </th>
          )}

          {materialGroup === 'liquid' && (
            <th>
              {SwitchAmountButton(lockAmountColumn, switchAmount, materialGroup)} {headers.volume}
            </th>
          )}
          <th>{headers.amount}</th>

          {materialGroup === 'solid' && <th>{headers.density}</th>}
          <th>{headers.eq}</th>
          <th>{headers.ref}</th>
          <th>
            {headers.concn}
            <OverlayTrigger
              placement="top"
              overlay={(
                <Tooltip id="info-total-conc">
                  Total Conc. will only be calculated when we have a Total volume
                </Tooltip>
              )}
            >
              <ControlLabel style={{ marginLeft: '5px' }}>
                <span style={{ cursor: 'pointer' }} className="glyphicon glyphicon-info-sign" />
              </ControlLabel>
            </OverlayTrigger>
          </th>
          {enableComponentLabel && <th>{headers.name}</th>}
          {enableComponentPurity && <th>{headers.purity}</th>}
        </tr>
        </thead>
        <tbody>
          {contents.map((item) => item)}
        </tbody>
      </table>
    </div>
  );
};

SampleComponentsGroup.propTypes = {
  materialGroup: PropTypes.string.isRequired,
  headIndex: PropTypes.number.isRequired,
  deleteMixtureComponent: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  sample: PropTypes.instanceOf(Sample).isRequired,
  dropSample: PropTypes.func.isRequired,
  dropMaterial: PropTypes.func.isRequired,
  switchAmount: PropTypes.func.isRequired,
  lockAmountColumn: PropTypes.bool,
  lockAmountColumnSolids: PropTypes.bool,
  enableComponentLabel: PropTypes.bool.isRequired,
  enableComponentPurity: PropTypes.bool.isRequired,
};

SampleComponentsGroup.defaultProps = {
  lockAmountColumn: false,
  lockAmountColumnSolids: false,
};

export default SampleComponentsGroup;
