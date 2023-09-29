import { OptionDescription } from "../reusables";

export const INVITE_CHECKBOX_LABEL: { owner: string; admin: string } = {
    owner: 'Only Owner can invite',
    admin: 'Only Admin can invite',
  };
  
 export  const GUILD_COMPARISON_OPTIONS: Array<OptionDescription> = [
    {
      heading: 'ALL',
      value: 'all',
    },
    {
      heading: 'ALL',
      value: 'any',
    },
    {
      heading: 'SPECIFIC',
      value: 'specific',
    },
  ];

 export  const OPERATOR_OPTIONS = [
    {
        heading: 'Any',
        value: 'any',
    },
    {
        heading: 'All',
        value: 'all',
    }
]


export const OPERATOR_OPTIONS_INFO:{any:string,all:string} = {
    any:'Any one of the following criteria must be true',
    all:'All of the following criteria must be true'
} ;

