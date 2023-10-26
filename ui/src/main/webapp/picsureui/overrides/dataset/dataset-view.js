define([ "underscore" ], function(_) {
    const categoryVariant = function(filter){
        const {
            Gene_with_variant: gene = [],
            Variant_consequence_calculated: consequenceList = [],
            Variant_frequency_as_text: frequency = []
        } = filter;
        const list = [];
        if(gene.length > 0){
            list.push(`<span class="list-title">Gene${gene.length > 1 ? 's' : ''} with Variant:</span> ${gene.join(', ')}`);
        }
        if(frequency.length > 0){
            list.push(`<span class="list-title">Variant Frequency:</span> ${frequency.join(', ')}`);
        }
        if(consequenceList.length > 0){
            list.push(`<span class="list-title">Calculated Variant Consequence:</span> ${consequenceList.join(', ')}`);
        }
        return list.join('<br />');
    };

    const numericVariant = function(filter){
        return Object.entries(filter)
            .map(([category, { min, max }]) => {
                const range = [];
                min && range.push(`Min: ${min}`);
                max && range.push(`Max: ${max}`);
                return `<span class="list-title">${category}:</span> Restrict values by ${range.join(', ')}`;
            });
    };

    return {
        mappers: {
            genomic: {
                path: ['query', 'query', 'query', 'variantInfoFilters'],
                renderId: "detail-filters",
                render: function(filtersList = []){
                    const filterString = [];
                    filtersList.map(({
                        numericVariantInfoFilters,
                        categoryVariantInfoFilters
                    }) => {
                        if(!_.isEmpty(categoryVariantInfoFilters)){
                            filterString.push(categoryVariant(categoryVariantInfoFilters))
                        }
                        if(!_.isEmpty(numericVariantInfoFilters)){
                            filterString.push(numericVariant(numericVariantInfoFilters));
                        }
                    });
                    return filterString.map(item => `<li>${item}</li>`).join('');
                }
            }
        }
    }
});