# This file imports all CRUD operations to provide a unified interface
from .device import (
    get_device,
    get_device_by_serial,
    get_devices,
    create_device,
    update_device,
    retire_device,
)
from .user import (
    get_user,
    get_user_by_username,
    get_user_by_email,
    get_users,
    create_user,
    update_user,
)
from .device_type import (
    get_device_type,
    get_device_type_by_name,
    get_device_types,
    create_device_type,
    update_device_type,
)
from .purchase import (
    get_purchase,
    get_purchase_by_po,
    get_purchases,
    create_purchase,
    update_purchase,
)
from .assignment import (
    get_assignment,
    get_assignments,
    create_assignment,
    return_device,
)
from .reports import (
    get_devices_by_type_report,
    get_device_status_report,
    get_user_assignments_report,
    get_expiring_warranties_report,
)