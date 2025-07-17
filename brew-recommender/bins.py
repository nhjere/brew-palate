

def total_wasted_space(shipments: list[int], bin_size: int) -> int:
    '''
    This function takes a list of integers, representing the number of items
    in each shipment, and a bin size, and computes the total wasted
    space across all shipments.

    Arguments:
        shipments: a list of integers
        bin_size: the capacity of each bin (all bins have the same capacity)

    Returns:
        The total wasted space across all shipments.
    '''

    freeSpace = []
    for shipment in shipments:
        remainder = shipment % bin_size
        if remainder != 0:
            space = bin_size - remainder
            freeSpace.append(space)    
    return sum(freeSpace)