module Usecases
    module Wellplates
      class TemplateCreation
        def initialize(wellplate)
            @wellplate = wellplate
            @header=['Position','Sample','External Compound Label/ID',	'Smiles',	'Readout1_Value','Readout1_Unit','Readout2_Value',	'Readout2_Unit']
        end

        def execute!
            xfile = Axlsx::Package.new
            file_extension = 'xlsx'
            xfile.workbook.styles.fonts.first.name = 'Calibri'
            sheet = xfile.workbook.add_worksheet(name: 'Wellplate import template')
            sheet.add_row(@header)
            
            start=0.1
            x=1
            @wellplate.wells.each do |well|
              well_data=[well.sortable_alphanumeric_position,'','','',start,'mg',x,'GW']
              x=x+1
              start=start+0.1
              sheet.add_row(well_data)
            end
            xfile
        end
      end
    end
end