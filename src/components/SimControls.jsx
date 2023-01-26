import React, {
  useMemo,
} from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Autocomplete,
  TextField,
  Chip,
  Typography,
  Button,
} from '@mui/material';

import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { debounce } from 'throttle-debounce';
import {
  useZkillPointsContext,
  loadVictim,
  loadAttackers,
  setZkillId,
} from '../contexts/ZkillPoints';

import { shipProps } from '../propTypes/ship';
import { moduleProps } from '../propTypes/module';

import SHIPS from '../data/ships.json';
import MODULES from '../data/modules.json';
import EftImportModal from './EftImportModal';
// import {

// } from './SimControls.styles';

const GroupHeader = styled.div(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '0.4em 1em',
  color: 'rgba(theme.palette.text.secondary, 0.8)',
  backgroundColor: theme.palette.background.default,
}));

const GroupItems = styled.ul({
  padding: 0,
});

function IconOption({ data, className, ...params }) {
  const theme = useTheme();
  return (
    <li className={`IconOption ${className}`} style={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.secondary }} {...params}>
      <img
        loading="lazy"
        style={{ width: '2em', marginRight: '0.5em' }}
        src={`https://images.evetech.net/types/${data.id}/icon?size=32`}
        alt=""
      />
      <span>
        {data.name}
        {/* {' - '}
    {Math.pow(5, data.rigSize)} */}
      </span>
    </li>
  );
}
IconOption.defaultProps = {
  className: '',
};
IconOption.propTypes = {
  data: PropTypes.oneOfType([
    shipProps,
    moduleProps,
  ]).isRequired,
  className: PropTypes.string,
};

function IconChip({ data, ...params }) {
  const theme = useTheme();
  return (
    <Chip
      sx={{ color: theme.palette.text.secondary }}
      avatar={(
        <img
          style={{ width: '2em', borderRadius: '100%' }}
          src={`https://images.evetech.net/types/${data.id}/icon?size=32`}
          alt=""
        />
)}
      label={data.name}
      {...params}
    />
  );
}
IconChip.propTypes = {
  data: PropTypes.oneOfType([
    shipProps,
    moduleProps,
  ]).isRequired,
};

function SimControls({ onSuccess, submitText }) {
  const { zkillPointsState, zkillPointsDispatch } = useZkillPointsContext();
  const [shipInfo, setShipInfo] = React.useState(zkillPointsState.shipInfo);
  const [modules, setModules] = React.useState(zkillPointsState.shipInfo
    ? zkillPointsState.shipInfo.modules : []);
  const [attackers, setAttackers] = React.useState(zkillPointsState.attackers);
  const [zkillUrl, setZkillUrl] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const availableAttackers = useMemo(() => [
    ...SHIPS,
  ].sort((a, b) => `${a.category} ${a.group} ${a.rigSize}`.localeCompare(`${b.category} ${b.group} ${b.rigSize}`)), []);
  const availableShips = useMemo(() => availableAttackers.filter((a) => a.category !== 'Entity'), [availableAttackers]);
  const availableModules = useMemo(() => [
    ...MODULES,
  ].sort((a, b) => `${a.group}`.localeCompare(`${b.group}`)), []);
  const submit = React.useCallback(() => {
    const newErrors = {};
    try {
      if (!shipInfo) throw new Error('No ship selected');
      zkillPointsDispatch(loadVictim({
        ...shipInfo,
        modules,
      }));
    } catch (err) {
      newErrors.ship = `${err}`;
    }
    try {
      if (attackers && attackers.length) {
        zkillPointsDispatch(loadAttackers(attackers));
      }
    } catch (err) {
      newErrors.attackers = `${err}`;
    }
    try {
      if (zkillUrl) {
        const zkillMatch = /zkillboard\.com\/kill\/(\d+)(\/|$)/.exec(zkillUrl);
        if (!zkillMatch || !zkillMatch[1]) throw new Error('Invalid zKillboard url. Please check the URL.');
        zkillPointsDispatch(setZkillId(zkillMatch[1]));
      }
    } catch (err) {
      newErrors.zkillUrl = `${err}`;
    }
    if (!Object.keys(newErrors).length) {
      onSuccess();
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  }, [
    zkillUrl,
    onSuccess,
    shipInfo,
    modules,
    attackers,
    zkillPointsDispatch,
  ]);

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{
        textAlign: 'left',
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 1,
        }}
      >
        <EftImportModal
          onSuccess={({ ship: newShip, modules: newModules }) => {
            setShipInfo(newShip);
            setModules(newModules);
          }}
        />
      </Box>
      <Autocomplete
        clearOnEscape
        options={availableShips}
        value={shipInfo}
        isOptionEqualToValue={() => false}
        groupBy={(option) => `${option.category !== 'Ship' ? `${option.category} - ${option.group}` : option.group}`}
        getOptionLabel={(option) => option.name}
        fullWidth
        sx={{ mb: 3 }}
        renderInput={(params) => (
          <TextField
            error={errors.ship}
            helperText={errors.ship}
            label="Ship"
            {...params}
          />
        )}
        renderTags={(tagValue, getTagProps) => (tagValue.map((option, index) => (
          <IconChip key={option.id} data={option} {...getTagProps({ index })} />
        )))}
        renderOption={(params, option) => (
          <IconOption key={option.id} data={option} {...params} />
        )}
        renderGroup={(params) => (
          <li key={params.group}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
        onChange={(event, newValue) => {
          setShipInfo(newValue);
        }}
      />
      <Autocomplete
        multiple
        disableCloseOnSelect
        clearOnEscape
        limitTags={1}
        options={availableModules}
        value={modules}
        sx={{ mb: 3 }}
        isOptionEqualToValue={() => false}
        groupBy={(option) => `${option.group}`}
        getOptionLabel={(option) => option.name}
        fullWidth
        renderInput={(params) => (
          <TextField
            error={errors.modules}
            label="Modules"
            {...params}
          />
        )}
        renderTags={(tagValue, getTagProps) => (tagValue.map((option, index) => (
          <IconChip key={option.id} data={option} {...getTagProps({ index })} />
        )))}
        renderOption={(params, option) => (
          <IconOption key={option.id} data={option} {...params} />
        )}
        renderGroup={(params) => (
          <li key={params.group}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
        onChange={(event, newValue) => {
          setModules(newValue);
        }}
      />
      <Autocomplete
        multiple
        disableCloseOnSelect
        clearOnEscape
        limitTags={1}
        options={availableAttackers}
        value={attackers}
        isOptionEqualToValue={() => false}
        groupBy={(option) => `${option.category !== 'Ship' ? `${option.category} - ${option.group}` : option.group}`}
        getOptionLabel={(option) => option.name}
        fullWidth
        sx={{ mb: 1 }}
        renderInput={(params) => (
          <TextField
            error={errors.attackers}
            label="Attackers"
            helperText={errors.attackers}
            {...params}
          />
        )}
        renderTags={(tagValue, getTagProps) => (tagValue.map((option, index) => (
          <IconChip key={option.id} data={option} {...getTagProps({ index })} />
        )))}
        renderOption={(params, option) => (
          <IconOption key={option.id} data={option} {...params} />
        )}
        renderGroup={(params) => (
          <li key={params.group}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
        onChange={(event, newValue) => {
          setAttackers(newValue);
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontStyle: 'italic',
          mb: 3,
        }}
      >
        Select the &quot;Rat&quot; option for any non-player attacker.
      </Typography>
      <TextField
        error={errors.zkillUrl}
        helperText={errors.zkillUrl}
        label="Related zKillboard URL"
        fullWidth
        sx={{ mb: 3 }}
        onChange={debounce(300, (e) => {
          setZkillUrl(e.target.value);
        })}
      />
      {/* <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
          Fit must be in
          {' '}
          <Link href="https://www.eveonline.com/news/view/import-export-fittings" target="_blank" rel="noreferrer">EFT format</Link>
          .
        </Typography> */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={submit}
      >
        {submitText}
      </Button>
    </Box>
  );
}

SimControls.defaultProps = {
  onSuccess: () => {},
  submitText: 'Submit',
};

SimControls.propTypes = {
  onSuccess: PropTypes.func,
  submitText: PropTypes.string,
};

export default SimControls;
